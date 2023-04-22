import { Request, Response, NextFunction } from "express";
import {
  assignPowerToStudent,
  getBlindnessAcFromStudent,
  getCurrentTeamFromStudent,
  getStudent,
  getTeamFromStudent,
  rafflePower
} from "@services/student.service";
import {
  addStudentToTeam,
  getMembersFromTeam,
  getTeamByCode,
  notifyStudentOfTeamUpdate,
  leaveTeam as leaveTeamService,
  checkReassignSuperHearing
} from "@services/team.service";
import { JoinTeamBodyDto } from "@dto/student/team.dto";
import {
  filterTeamsForStudents,
  getTeamsFromCourseWithStudents,
  notifyCourseOfTeamUpdate
} from "@services/course.service";
import { TeamDetailDto } from "@dto/student/team.dto";
import { getCurrTaskAttempt } from "@services/taskAttempt.service";
import { Power } from "@interfaces/enums/taskAttempt.enum";
import { directory } from "@listeners/namespaces/student";
import { getTaskById } from "@services/task.service";
import { getHighestTaskCompletedFromStudent } from "@services/studentTask.service";
import { ApiError } from "@middlewares/handleErrors";
import * as repositoryService from "@services/repository.service";
import { StudentModel } from "@models";

export async function getTeams(
  req: Request,
  res: Response<TeamDetailDto[]>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  try {
    const { id_course } = await repositoryService.findOne<StudentModel>(
      StudentModel,
      { where: { id_student: idStudent } }
    );
    res
      .status(200)
      .json(
        filterTeamsForStudents(await getTeamsFromCourseWithStudents(id_course))
      );
  } catch (err) {
    next(err);
  }
}

export async function getCurrentTeam(
  req: Request,
  res: Response<TeamDetailDto & { myPower?: Power }>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  try {
    res.status(200).json(await getCurrentTeamFromStudent(idStudent));
  } catch (err) {
    next(err);
  }
}

export async function joinTeam(
  req: Request<JoinTeamBodyDto>,
  res: Response,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;

  const socket = directory.get(idStudent);
  if (!socket)
    return res.status(400).json({ message: "Student is not connected" });

  const { code, taskOrder } = req.body as JoinTeamBodyDto;
  if (!code || !taskOrder) {
    throw new ApiError("Wrong body", 400);
  }

  try {
    const nextTaskOrder =
      ((await getHighestTaskCompletedFromStudent(idStudent))?.task_order || 0) +
      1;
    if (taskOrder > nextTaskOrder) {
      throw new ApiError(
        `You should first complete task ${nextTaskOrder}`,
        400
      );
    }

    let prevTeamId: number | undefined;
    let prevPower: Power | null | undefined;
    try {
      prevTeamId = (await getTeamFromStudent(idStudent)).id_team; // check if student is already in a team
      prevPower = (await getCurrTaskAttempt(idStudent)).power; // check if student has a power
    } catch (err) {} // no team found for student (expected)

    const team = await getTeamByCode(code);
    if (team.id_team === prevTeamId) {
      throw new ApiError("Student is already in this team", 400);
    }

    const student = await repositoryService.findOne<StudentModel>(
      StudentModel,
      {
        where: { id_student: idStudent }
      }
    );
    if (student.id_course !== team.id_course) {
      throw new ApiError("Student and team are not in the same course", 400);
    }
    if (!team.active) {
      throw new ApiError("Team is not active", 400);
    }

    const teammates = await getMembersFromTeam({ idTeam: team.id_team });
    if (teammates.length >= 3) {
      throw new ApiError("Team is full", 400);
    }

    if (teammates.length) {
      // check if the team is already working on a different task
      const { id_task } = await getCurrTaskAttempt(teammates[0].id_student);
      const { task_order: taskOrderTeam } = await getTaskById(id_task);
      if (taskOrderTeam !== taskOrder) {
        throw new ApiError(
          "This team is already working on a different task",
          400
        );
      }
    }

    await addStudentToTeam(idStudent, team.id_team, taskOrder);
    res.status(200).json({ message: "Student joined team" });

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

      if (prevTeamId && prevPower) {
        checkReassignSuperHearing(prevTeamId, prevPower).catch((err) =>
          console.log(err)
        );
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    next(err);
  }
}

export async function leaveTeam(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;

  const socketStudent = directory.get(idStudent);
  if (!socketStudent) {
    return res.status(400).json({ message: "Student is not connected" });
  }

  try {
    await leaveTeamService(idStudent, socketStudent);
    res.status(200).json({ message: "Done" });
  } catch (err) {
    next(err);
  }
}

export async function ready(req: Request, res: Response, next: NextFunction) {
  const { id: idStudent } = req.user!;
  try {
    const { power } = await getCurrTaskAttempt(idStudent);
    if (!power)
      return res.status(400).json({ message: "You don't have any power" });
    res.status(200).json({ message: "Ok" });
  } catch (err) {
    next(err);
  }
}

export async function reroll(req: Request, res: Response, next: NextFunction) {
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
