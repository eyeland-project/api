import { Request, Response, NextFunction } from "express";
import {
  getCurrentTeamFromStudent,
  rafflePower
} from "@services/student.service";
import {
  leaveTeamService as leaveTeamService,
  joinTeam as joinTeamService,
  getTeamsForStudent
} from "@services/team.service";
import { JoinTeamDto } from "@dto/student/team.dto";
import { TeamDetailDto } from "@dto/student/team.dto";
import { getCurrTaskAttempt } from "@services/taskAttempt.service";
import { Power } from "@interfaces/enums/taskAttempt.enum";
import { ApiError } from "@middlewares/handleErrors";

export async function getTeams(
  req: Request,
  res: Response<TeamDetailDto[]>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  try {
    res.status(200).json(await getTeamsForStudent(idStudent));
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
  req: Request<any, any, JoinTeamDto>,
  res: Response,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const { code, taskOrder } = req.body;
  try {
    if (!code || !taskOrder) {
      throw new ApiError("Wrong body", 400);
    }
    await joinTeamService(idStudent, code, taskOrder);
    res.status(200).json({ message: "Done" });
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
  try {
    await leaveTeamService(idStudent);
    res.status(200).json({ message: "Done" });
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
