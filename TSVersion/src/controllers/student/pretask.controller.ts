import { Request, Response, NextFunction } from "express";
import { getQuestionsFromPretaskForStudent } from "@services/question.service";
import { AnswerSelectCreateDto } from "@dto/student/answer.dto";
import { answerPretask } from "@services/answer.service";
import { getPretaskForStudent } from "@services/taskStage.service";
import { completePretask } from "@services/studentTask.service";
import { QuestionPretaskDetailDto } from "@dto/student/question.dto";
import { TaskStageDetailDto } from "@dto/student/taskStage.dto";
import { ApiError } from "@middlewares/handleErrors";

export async function getPretask(
  req: Request<{ taskOrder: string }>,
  res: Response<TaskStageDetailDto>,
  next: NextFunction
) {
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    res.status(200).json(await getPretaskForStudent(taskOrder));
  } catch (err) {
    next(err);
  }
}

export async function getQuestions(
  req: Request<{ taskOrder: string }>,
  res: Response<QuestionPretaskDetailDto[]>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    res
      .status(200)
      .json(await getQuestionsFromPretaskForStudent(idStudent, taskOrder));
  } catch (err) {
    next(err);
  }
}

export async function answer(
  req: Request<{ taskOrder: string; questionOrder: string }>,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const { idOption, answerSeconds, newAttempt } =
    req.body as AnswerSelectCreateDto;
  const taskOrder = parseInt(req.params.taskOrder);
  const questionOrder = parseInt(req.params.questionOrder);

  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    if (isNaN(questionOrder) || questionOrder <= 0) {
      throw new ApiError("Invalid questionOrder", 400);
    }
    if (idOption <= 0) {
      throw new ApiError("Invalid idOption");
    }

    await answerPretask(
      idStudent,
      taskOrder,
      questionOrder,
      idOption,
      newAttempt,
      answerSeconds
    );
    res.status(200).json({
      message: `Answered question ${questionOrder} of pretask ${taskOrder}`
    });
  } catch (err) {
    next(err);
  }
}

export async function setCompleted(
  req: Request<{ taskOrder: string }>,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    await completePretask(taskOrder, idStudent);
    res.status(200).json({ message: `Completed pretask ${taskOrder}` });
  } catch (err) {
    next(err);
  }
}
