import { Request, Response, NextFunction } from "express";
import { getQuestionFromPostaskForStudent } from "@services/question.service";
import { answerPostask } from "@services/answer.service";
import {
  AnswerAudioCreateDto,
  AnswerOptionCreateDto
} from "@dto/student/answer.dto";
import { getPostaskForStudent } from "@services/taskStage.service";
import { QuestionPostaskDetailDto } from "@dto/student/question.dto";
import { TaskStageDetailDto } from "@dto/student/taskStage.dto";
import { ApiError } from "@middlewares/handleErrors";
import { getStorageBucket } from "@config/storage";
import { uploadFileToServer } from "@config/multer";
import { format } from "util";

export async function getPostask(
  req: Request<{ taskOrder: string }>,
  res: Response<TaskStageDetailDto>,
  next: NextFunction
) {
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder");
    }
    res.status(200).json(await getPostaskForStudent(taskOrder));
  } catch (err) {
    next(err);
  }
}

export async function getQuestion(
  req: Request<{ taskOrder: string; questionOrder: string }>,
  res: Response<QuestionPostaskDetailDto>,
  next: NextFunction
) {
  const taskOrder = parseInt(req.params.taskOrder);
  const questionOrder = parseInt(req.params.questionOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder");
    }
    if (isNaN(questionOrder) || questionOrder <= 0) {
      throw new ApiError("Invalid questionOrder");
    }
    res
      .status(200)
      .json(await getQuestionFromPostaskForStudent(taskOrder, questionOrder));
  } catch (err) {
    next(err);
  }
}

export async function answer(
  req: Request<
    { taskOrder: string; questionOrder: string },
    any,
    AnswerAudioCreateDto
  >,
  res: Response,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const { idOption, answerSeconds, newAttempt } = req.body;
  const taskOrder = parseInt(req.params.taskOrder);
  const questionOrder = parseInt(req.params.questionOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder");
    }
    if (isNaN(questionOrder) || questionOrder <= 0) {
      throw new ApiError("Invalid questionOrder");
    }
    await uploadFileToServer("audio")(req, res);
    const audio = req.file;

    const result = await answerPostask(
      idStudent,
      taskOrder,
      questionOrder,
      idOption,
      newAttempt,
      answerSeconds,
      audio
    );
    res.status(200).json({
      message: `Answered question ${questionOrder} of postask ${taskOrder}`,
      result: audio ? result : undefined
    });
  } catch (err) {
    next(err);
  }
}
