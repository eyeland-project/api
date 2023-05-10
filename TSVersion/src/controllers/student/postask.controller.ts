import { Request, Response, NextFunction } from "express";
import { getQuestionsFromPostaskForStudent } from "@services/question.service";
import { answerPostask } from "@services/answer.service";
import {
  AnswerSelectSpeakingCreateDto,
  AnswerOpenCreateDto
} from "@dto/student/answer.dto";
import { getPostaskForStudent } from "@services/taskStage.service";
import { QuestionPostaskDetailDto } from "@dto/student/question.dto";
import { TaskStageDetailDto } from "@dto/student/taskStage.dto";
import { ApiError } from "@middlewares/handleErrors";
import { uploadFileToServer } from "@config/multer";
import { completePostask } from "@services/studentTask.service";

export async function getPostask(
  req: Request<{ taskOrder: string }>,
  res: Response<TaskStageDetailDto>,
  next: NextFunction
) {
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    res.status(200).json(await getPostaskForStudent(taskOrder));
  } catch (err) {
    next(err);
  }
}

export async function getQuestions(
  req: Request<{ taskOrder: string }>,
  res: Response<QuestionPostaskDetailDto[]>,
  next: NextFunction
) {
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    res.status(200).json(await getQuestionsFromPostaskForStudent(taskOrder));
  } catch (err) {
    next(err);
  }
}

export async function answer(
  req: Request<
    { taskOrder: string; questionOrder: string },
    any,
    AnswerSelectSpeakingCreateDto | AnswerOpenCreateDto
  >,
  res: Response,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const taskOrder = parseInt(req.params.taskOrder);
  const questionOrder = parseInt(req.params.questionOrder);

  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid taskOrder", 400);
    }
    if (isNaN(questionOrder) || questionOrder <= 0) {
      throw new ApiError("Invalid questionOrder", 400);
    }

    let audio: Express.Multer.File | undefined;

    // check if the question is select speaking
    if ((<AnswerSelectSpeakingCreateDto>req.body).idOption !== undefined) {
      // retrieve audio file from request
      await uploadFileToServer("audio")(req, res);
      audio = req.file;
    } else if ((<AnswerOpenCreateDto>req.body).text === undefined) {
      // check if the question is open
      await uploadFileToServer("audio")(req, res);
      audio = req.file;
      if (!audio) {
        // if the question is open, audio file is required (since text was not given)
        throw new ApiError("Audio file is required", 400);
      }
    }
    const result = await answerPostask(
      idStudent,
      taskOrder,
      questionOrder,
      req.body,
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
    await completePostask(taskOrder, idStudent);
    res.status(200).json({ message: `Completed pretask ${taskOrder}` });
  } catch (err) {
    next(err);
  }
}
