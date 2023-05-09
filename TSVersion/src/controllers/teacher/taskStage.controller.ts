import { Request, Response, NextFunction } from "express";
import {
  TaskStageDetailDto,
  TaskStagesDetailDto
} from "@dto/teacher/taskStage.dto";
import {
  getDuringtaskForTeacher,
  getPostaskForTeacher,
  getPretaskForTeacher,
  getTaskStagesForTeacher
} from "@services/taskStage.service";
import { ApiError } from "@middlewares/handleErrors";

export async function getPretask(
  req: Request<{ idTask: string }>,
  res: Response<TaskStageDetailDto>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getPretaskForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}
export async function getDuringtask(
  req: Request<{ idTask: string }>,
  res: Response<TaskStageDetailDto>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getDuringtaskForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}

export async function getPostask(
  req: Request<{ idTask: string }>,
  res: Response<TaskStageDetailDto>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getPostaskForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}

export async function getTaskStages(
  req: Request<{ idTask: string }>,
  res: Response<TaskStagesDetailDto>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getTaskStagesForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}
