import { Request, Response, NextFunction } from "express";
import { getNextQuestionFromDuringtaskForStudent } from "@services/question.service";
import { getDuringtaskForStudent } from "@services/taskStage.service";
import { ApiError } from "@middlewares/handleErrors";
import { AnswerSelectCreateDto } from "@dto/student/answer.dto";
import { answerDuringtask } from "@services/answer.service";
import { QuestionDuringtaskDetailDto } from "@dto/student/question.dto";
import { TaskStageDetailDto } from "@dto/student/taskStage.dto";

export async function getDuringtask(
  req: Request<{ taskOrder: string }>,
  res: Response<TaskStageDetailDto>,
  next: NextFunction
) {
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    res.status(200).json(await getDuringtaskForStudent(taskOrder));
  } catch (err) {
    next(err);
  }
}

export async function getNextQuestion(
  req: Request<{ taskOrder: string }>,
  res: Response<QuestionDuringtaskDetailDto>,
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
      .json(
        await getNextQuestionFromDuringtaskForStudent(idStudent, taskOrder)
      );
  } catch (err) {
    next(err);
  }
}

export async function answer(
  req: Request<
    { taskOrder: string; questionOrder: string },
    any,
    AnswerSelectCreateDto
  >,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const { idOption, answerSeconds } = req.body;
  const taskOrder = parseInt(req.params.taskOrder);
  const questionOrder = parseInt(req.params.questionOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    if (isNaN(questionOrder) || questionOrder <= 0) {
      throw new ApiError("Invalid questionOrder", 400);
    }
    const { alreadyAnswered } = await answerDuringtask(
      idStudent,
      taskOrder,
      questionOrder,
      idOption,
      answerSeconds
    );
    if (!alreadyAnswered) return res.status(200).json({ message: "Answered" });
    res.status(202).json({ message: "Already answered" });
  } catch (err) {
    next(err);
  }
}
