import { Request, Response, NextFunction } from "express";
import {
  QuestionPretaskDetailDto,
  QuestionsTaskDetailDto
} from "@dto/teacher/question.dto";
import { ApiError } from "@middlewares/handleErrors";
import {
  QuestionDuringtaskDetailDto,
  QuestionPostaskDetailDto
} from "@dto/global/question.dto";
import {
  getQuestionsFromDuringtaskForTeacher,
  getQuestionsFromPostaskForTeacher,
  getQuestionsFromPretaskForTeacher,
  getQuestionsFromTaskForTeacher
} from "@services/question.service";

export async function getPretaskQuestions(
  req: Request<{ idTask: string }>,
  res: Response<QuestionPretaskDetailDto[]>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getQuestionsFromPretaskForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}

export async function getDuringtaskQuestions(
  req: Request<{ idTask: string }>,
  res: Response<QuestionDuringtaskDetailDto[]>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getQuestionsFromDuringtaskForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}

export async function getPostaskQuestions(
  req: Request<{ idTask: string }>,
  res: Response<QuestionPostaskDetailDto[]>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getQuestionsFromPostaskForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}

export async function getTaskQuestions(
  req: Request<{ idTask: string }>,
  res: Response<QuestionsTaskDetailDto>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getQuestionsFromTaskForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}
