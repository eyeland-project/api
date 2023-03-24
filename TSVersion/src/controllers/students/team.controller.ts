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
  notifyStudentOfTeamUpdate,
  leaveTeam as leaveTeamService,
} from "../../services/team.service";
import { ApiError } from "../../middlewares/handleErrors";
import { LoginTeamReq } from "../../types/requests/students.types";
import {
  getTeamsFromCourseWithStudents,
  notifyCourseOfTeamUpdate
} from "../../services/course.service";
import {
  StudentSocket,
  TeamResp,
  TeamSocket
} from "../../types/responses/students.types";
import { getStudCurrTaskAttempt } from "../../services/taskAttempt.service";
import { OutgoingEvents, Power } from "../../types/enums";
import { PowerReq } from "../../types/requests/students.types";
import { Namespaces, of } from "../../listeners/sockets";
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
    const teams = (await getTeamsFromCourseWithStudents(id_course)).filter(
      (t) => t.active
    );
    res.status(200).json(teams);
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
        return res.status(400).json({
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
          try {
            const { yaper } = await assignPowerToStudent(
              idStudent,
              "auto",
              teammates,
              level,
              false
            );
            notifyCourseOfTeamUpdate(
              student.id_course,
              team.id_team,
              idStudent
            );
            if (yaper) notifyStudentOfTeamUpdate(yaper);
          } catch (err) {
            console.log(err);
          }
        })
        .catch((err) => console.log(err));

      if (prevTeam) {
        // notify previous team that student left
        const nsp = of(Namespaces.STUDENTS);
        if (!nsp) return;

        const idPrevTeam = prevTeam.id_team;
        getMembersFromTeam({ idTeam: idPrevTeam })
          .then((prevTeamMembers) => {
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

  const socketStudent = directory.get(idStudent);
  if (!socketStudent) {
    return res.status(400).json({ message: "Student is not connected" });
  }

  try {
    await leaveTeamService(idStudent, socketStudent, () => (
      res.status(200).json({ message: "Done" })
    ));
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
    if (!power) {
      return res.status(304).json({ message: "You got the same power" });
    }
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
