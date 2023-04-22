import { Request, Response, NextFunction } from "express";
import { createMissingTeams } from "@services/course.service";
import { getTeamsForTeacher, getTeamForTeacher } from "@services/team.service";
import { TeamDetailDto } from "@dto/teacher/team.dto";
import { ApiError } from "@middlewares/handleErrors";

export async function getTeams(
  req: Request<{ idCourse: string }>,
  res: Response<TeamDetailDto[]>,
  next: NextFunction
) {
  const { active } = req.query as { active?: boolean };
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Wrong idCourse", 400);
    }
    res.status(200).json(await getTeamsForTeacher(idCourse, active || true));
  } catch (err) {
    next(err);
  }
}

export async function getTeam(
  req: Request<{ idCourse: string; idTeam: string }>,
  res: Response<TeamDetailDto>,
  next: NextFunction
) {
  const idTeam = parseInt(req.params.idTeam);
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Wrong idCourse", 400);
    }
    if (isNaN(idTeam) || idTeam <= 0) {
      throw new ApiError("Wrong idTeam", 400);
    }
    res.status(200).json(await getTeamForTeacher(idCourse, idTeam));
  } catch (err) {
    next(err);
  }
}

export async function initTeams(
  req: Request<{ idCourse: number }, any, { socketBased: boolean }>,
  res: Response,
  next: NextFunction
) {
  const { idCourse } = req.params;
  const { socketBased } = req.body;
  try {
    await createMissingTeams(idCourse, socketBased ?? false);
    res.status(200).json({ message: "Teams initialized successfully" });
  } catch (err) {
    next(err);
  }
}
