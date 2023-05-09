import { TaskAttemptSubmissionDetailDto } from "@dto/teacher/taskAttempt.dto";
import { ApiError } from "@middlewares/handleErrors";
import {
  getTaskAttemptFromCourseForTeacher,
  getTaskAttemptsFromCourseForTeacher
} from "@services/taskAttempt.service";
import { NextFunction, Request, Response } from "express";

export async function getTaskAttempts(
  req: Request<{ idCourse: string }>,
  res: Response<TaskAttemptSubmissionDetailDto[]>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    res
      .status(200)
      .json(await getTaskAttemptsFromCourseForTeacher(idTeacher, idCourse));
  } catch (err) {
    next(err);
  }
}

export async function getTaskAttempt(
  req: Request<{ idCourse: string; idTaskAttempt: string }>,
  res: Response<TaskAttemptSubmissionDetailDto>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  const idTaskAttempt = parseInt(req.params.idTaskAttempt);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    if (isNaN(idTaskAttempt) || idTaskAttempt <= 0) {
      throw new ApiError("Invalid task attempt id", 400);
    }
    res
      .status(200)
      .json(
        await getTaskAttemptFromCourseForTeacher(
          idTeacher,
          idCourse,
          idTaskAttempt
        )
      );
  } catch (err) {
    next(err);
  }
}
