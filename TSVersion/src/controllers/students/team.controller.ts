import { Request, Response } from "express";
import {
  assignPowerToStudent,
  getBlindnessAcFromStudent,
  getStudentById,
  getTeamFromStudent,
  getTeammates,
  rafflePower
} from "../../services/student.service";
import {
  addStudentToTeam,
  getMembersFromTeam,
  getTeamByCode,
  removeStudFromTeam
} from "../../services/team.service";
import { ApiError } from "../../middlewares/handleErrors";
import { LoginTeamReq } from "../../types/requests/students.types";
import { getTeamsFromCourseWithStudents } from "../../services/course.service";
import {
  StudentSocket,
  TeamResp,
  TeamSocket
} from "../../types/responses/students.types";
import { getStudCurrTaskAttempt } from "../../services/taskAttempt.service";
import { OutgoingEvents, Power } from "../../types/enums";
import { PowerReq } from "../../types/requests/students.types";
import { Namespace, of } from "../../listeners/sockets";
import { TeamMember } from "../../types/Student.types";
import { directory } from "../../listeners/namespaces/students";
import { getTaskById } from "../../services/task.service";
import sequelize from "../../database/db";
import { QueryTypes } from "sequelize";
import {
  getHighestTaskCompletedFromStudent,
  getStudentTasks
} from "../../services/studentTask.service";

export async function getTeams(
  req: Request,
  res: Response<TeamResp[]>,
  next: Function
) {
  const { id: idStudent } = req.user!;
  try {
    const { id_course } = await getStudentById(idStudent);
    const teams = await getTeamsFromCourseWithStudents(id_course);
    console.log(teams);

    const activeTeams = teams.filter((t) => t.active);
    if (!activeTeams.length) {
      return res.status(200).json(activeTeams);
    }

    const nextTaskOrder =
      ((await getHighestTaskCompletedFromStudent(idStudent))?.task_order || 0) +
      1;

    interface TeamWithTask {
      id_team: number;
      task_order: number | null;
    }
    const teamsWithTasks = await sequelize.query<TeamWithTask>(
      `
            SELECT te.id_team, t.task_order
            FROM team te
            LEFT JOIN task_attempt ta ON ta.id_team = te.id_team AND ta.active = true
            LEFT JOIN task t ON t.id_task = ta.id_task
            WHERE ${activeTeams
              .map((team) => `te.id_team = ${team.id}`)
              .join(" OR ")}
            GROUP BY te.id_team, t.task_order;
        `,
      { type: QueryTypes.SELECT }
    );
    console.log(teamsWithTasks);

    res.status(200).json(
      activeTeams.filter((team) => {
        const teamWithTask = teamsWithTasks.find((t) => t.id_team === team.id);
        if (!teamWithTask) {
          // should never happen
          console.log("Unexpected error: team not found in teamsWithTasks");
          return false;
        }
        return (
          teamWithTask.task_order === null || // the team is not working on any task yet
          nextTaskOrder >= teamWithTask.task_order // or the team is working on the next task of the student
        );
      })
    );
  } catch (err) {
    next(err);
  }
}

export async function getCurrentTeam(
  req: Request,
  res: Response<TeamResp & { myPower?: Power }>,
  next: Function
) {
  const { id: idStudent } = req.user!;
  try {
    const { id_team, name, code } = await getTeamFromStudent(idStudent);
    const members = await getMembersFromTeam({ idTeam: id_team });
    res.status(200).json({
      id: id_team,
      name,
      code: code || "",
      myPower: members.find((m) => m.id_student === idStudent)?.task_attempt
        .power,
      students: members.map(
        ({
          id_student,
          first_name,
          last_name,
          task_attempt: { power },
          username
        }) => ({
          id: id_student,
          firstName: first_name,
          lastName: last_name,
          username,
          power
        })
      )
    });
  } catch (err) {
    next(err);
  }
}

export async function joinTeam(
  req: Request<LoginTeamReq>,
  res: Response,
  next: Function
) {
  const { id: idStudent } = req.user!;

  const socket = directory.get(idStudent);
  if (!socket)
    return res.status(400).json({ message: "Student is not connected" });

  const { code, taskOrder } = req.body as LoginTeamReq;
  if (!code || !taskOrder)
    return res.status(400).json({ message: "Wrong body" });

  try {
    const nextTaskOrder =
      ((await getHighestTaskCompletedFromStudent(idStudent))?.task_order || 0) +
      1;
    if (taskOrder > nextTaskOrder) {
      return res
        .status(400)
        .json({ message: `You should first complete task ${nextTaskOrder}` });
    }

    let prevTeam;
    try {
      prevTeam = await getTeamFromStudent(idStudent); // check if student is already in a team
    } catch (err) {} // no team found for student (expected)

    const team = await getTeamByCode(code);
    if (team.id_team === prevTeam?.id_team) {
      return res
        .status(400)
        .json({ message: "Student is already in this team" });
    }

    const student = await getStudentById(idStudent);
    if (student.id_course !== team.id_course) {
      return res
        .status(400)
        .json({ message: "Student and team are not in the same course" });
    }
    if (!team.active) {
      return res.status(400).json({ message: "Team is not active" });
    }

    const teammates = await getMembersFromTeam({ idTeam: team.id_team });
    if (teammates.length >= 3) {
      return res.status(400).json({ message: "Team is full" });
    }

    if (teammates.length) {
      // check if the team is already working on a different task
      const { id_task } = await getStudCurrTaskAttempt(teammates[0].id_student);
      const { task_order } = await getTaskById(id_task);
      if (task_order !== taskOrder) {
        return res
          .status(400)
          .json({
            message: "This team is already working on a different task"
          });
      }
    }

    await addStudentToTeam(idStudent, team.id_team, taskOrder);
    res.status(200).json({ message: "Done" });

    // assign power + sockets (this could go to a subroutine)
    try {
      // if an error occurs, then it will not be sent to the next() function and the server will not crash
      socket.join("t" + team.id_team); // join student to team socket room

      getBlindnessAcFromStudent(idStudent)
        .then(async ({ level }) => {
          let power: Power | null;
          try {
            power = await assignPowerToStudent(
              idStudent,
              "auto",
              teammates,
              level,
              false
            );
          } catch (err) {
            console.log(err);
            power = null;
          }

          let teamsData: TeamSocket[] | undefined; // for the course
          let teamData: StudentSocket[] | undefined; // for the team the student joined

          try {
            teamsData = (
              await getTeamsFromCourseWithStudents(team.id_course)
            ).filter((t) => t.active);
          } catch (err) {
            console.log(err);
          }

          if (teamsData) {
            socket.broadcast
              .to("c" + team.id_course)
              .except("t" + team.id_team)
              .emit(OutgoingEvents.TEAMS_UPDATE, teamsData);
            teamData = teamsData.find((t) => t.id === team.id_team)?.students;
          }
          if (!teamData) {
            teamData = [
              ...summMembers(teammates),
              {
                id: idStudent,
                firstName: student.first_name,
                lastName: student.last_name,
                username: student.username,
                power
              }
            ];
          }
          socket.broadcast
            .to("t" + team.id_team)
            .emit(OutgoingEvents.TEAM_UPDATE, teamData);
        })
        .catch((err) => console.log(err));

      if (prevTeam) {
        // notify previous team that student left
        const nsp = of(Namespace.STUDENTS);
        if (!nsp) return;

        const idPrevTeam = prevTeam.id_team;
        getMembersFromTeam({ idTeam: idPrevTeam })
          .then(async (prevTeamMembers) => {
            const teamData: StudentSocket[] = summMembers(prevTeamMembers);
            nsp.to("t" + idPrevTeam).emit(OutgoingEvents.TEAM_UPDATE, teamData);
          })
          .catch((err) => console.log(err));
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    next(err);
  }
}

export async function leaveTeam(req: Request, res: Response, next: Function) {
  const { id: idStudent } = req.user!;

  const studSocket = directory.get(idStudent);
  if (!studSocket)
    return res.status(400).json({ message: "Student is not connected" });

  try {
    const power = (await getStudCurrTaskAttempt(idStudent)).power;
    const { id_team, id_course } = await getTeamFromStudent(idStudent); // check if student is already in a team
    await removeStudFromTeam(idStudent);
    res.status(200).json({ message: "Done" });

    try {
      studSocket.leave("t" + id_team); // leave student from team socket room
      // check if this student had super_hearing to assign it to another student
      if (power === Power.SUPER_HEARING) {
        getMembersFromTeam({ idTeam: id_team })
          .then(async (teammates) => {
            if (!teammates.length) return; // no teammates left

            const blindnessLevels = teammates.map(
              ({ blindness_acuity: { level } }) => level
            );
            const maxBlindnessLevel = Math.max(...blindnessLevels);
            if (maxBlindnessLevel === 0) return; // no teammates with blindness

            const withMaxBlindnessIdx =
              blindnessLevels.indexOf(maxBlindnessLevel);
            const { id_student: idNewStudent } = teammates[withMaxBlindnessIdx];
            await assignPowerToStudent(
              idNewStudent,
              Power.SUPER_HEARING,
              teammates
            );
          })
          .catch((err) => console.log(err));
      }

      try {
        const teamsData = (
          await getTeamsFromCourseWithStudents(id_course)
        ).filter((t) => t.active);
        studSocket.broadcast
          .to("c" + id_course)
          .except("t" + id_team)
          .emit(OutgoingEvents.TEAMS_UPDATE, teamsData);
      } catch (err) {
        console.error(err);
      }

      const nsp = of(Namespace.STUDENTS);
      if (!nsp) return;
      getMembersFromTeam({ idTeam: id_team })
        .then(async (teamMembers) => {
          const teamData: StudentSocket[] = summMembers(teamMembers);
          nsp.to("t" + id_team).emit(OutgoingEvents.TEAM_UPDATE, teamData);
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    next(err);
  }
}

export async function reqPower(req: Request, res: Response, next: Function) {
  const { power } = req.body as PowerReq;
  const { id: idStudent } = req.user!;
  try {
    await assignPowerToStudent(idStudent, power);
    res.status(200).json({ message: "Power assigned successfully" });
  } catch (err) {
    next(err);
  }
}

export async function ready(req: Request, res: Response, next: Function) {
  const { id: idStudent } = req.user!;
  try {
    const { power } = await getStudCurrTaskAttempt(idStudent);
    if (!power)
      return res.status(400).json({ message: "You don't have any power" });
    res.status(200).json({ message: "Ok" });
  } catch (err) {
    next(err);
  }
}

export async function reroll(req: Request, res: Response, next: Function) {
  const { id: idStudent } = req.user!;
  try {
    // * Students are being notified directly in the rafflePower function
    const power = await rafflePower(idStudent);
    if (!power)
      return res.status(304).json({ message: "You got the same power" });

    res.status(200).json({ power });
  } catch (err) {
    next(err);
  }
}

// this should be in a separate file
const summMembers = (
  teammates: TeamMember[]
): StudentSocket[] => // summarize members data to send to client
  teammates.map(
    ({
      id_student,
      first_name,
      last_name,
      username,
      task_attempt: { power }
    }) => ({
      id: id_student,
      firstName: first_name,
      lastName: last_name,
      username,
      power
    })
  );
