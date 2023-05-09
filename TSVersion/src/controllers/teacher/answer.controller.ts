import {
  QuestionSubmissionDetailDuringtaskDto,
  QuestionSubmissionDetailPostaskDto,
  QuestionSubmissionDetailPretaskDto
} from "@dto/teacher/answer.dto";
import { ApiError } from "@middlewares/handleErrors";
import {
  getAnswersFromDuringtaskForTeacher,
  getAnswersFromPostaskForTeacher,
  getAnswersFromPretaskForTeacher
} from "@services/answer.service";
import { NextFunction, Request, Response } from "express";

export async function getAnswersFromPretask(
  req: Request<{ idCourse: string; idTaskAttempt: string }>,
  res: Response<QuestionSubmissionDetailPretaskDto[]>,
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
        await getAnswersFromPretaskForTeacher(
          idTeacher,
          idCourse,
          idTaskAttempt
        )
      );
  } catch (err) {
    next(err);
  }
}

export async function getAnswersFromDuringtask(
  req: Request<{ idCourse: string; idTaskAttempt: string }>,
  res: Response<QuestionSubmissionDetailDuringtaskDto[]>,
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
        await getAnswersFromDuringtaskForTeacher(
          idTeacher,
          idCourse,
          idTaskAttempt
        )
      );
  } catch (err) {
    next(err);
  }
}

export async function getAnswersFromPostask(
  req: Request<{ idCourse: string; idTaskAttempt: string }>,
  res: Response<QuestionSubmissionDetailPostaskDto[]>,
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
        await getAnswersFromPostaskForTeacher(
          idTeacher,
          idCourse,
          idTaskAttempt
        )
      );
  } catch (err) {
    next(err);
  }
}
