import { Request, Response } from "express";
import {
  getQuestionByOrder,
  getTaskStageQuestionsCount
} from "../../services/question.service";
import {
  DuringtaskQuestionResp,
  PostaskResp
} from "../../types/responses/students.types";
import { getQuestionOptions } from "../../services/option.service";
import { answerPostask } from "../../services/answer.service";
import { AnswerOptionReq } from "../../types/requests/students.types";
import { getTaskStageByOrder } from "../../services/taskStage.service";

export async function root(
  req: Request<{ taskOrder: number }>,
  res: Response<PostaskResp>,
  next: Function
) {
  try {
    const { taskOrder } = req.params;
    const { description, keywords, id_task_stage } = await getTaskStageByOrder(
      taskOrder,
      3
    );
    res.status(200).json({
      description: description,
      keywords: keywords,
      numQuestions: await getTaskStageQuestionsCount(id_task_stage)
    });
  } catch (err) {
    next(err);
  }
}

export async function getQuestion(
  req: Request<{ taskOrder: number; questionOrder: number }>,
  res: Response<DuringtaskQuestionResp>,
  next: Function
) {
  try {
    const { taskOrder, questionOrder } = req.params;

    const {
      id_question,
      content,
      type,
      img_alt,
      img_url,
      audio_url,
      video_url
    } = await getQuestionByOrder(taskOrder, 3, questionOrder);
    const options = await getQuestionOptions(id_question);

    res.status(200).json({
      content,
      type,
      id: id_question,
      imgAlt: img_alt || "",
      imgUrl: img_url || "",
      audioUrl: audio_url || "",
      videoUrl: video_url || "",
      options: options.map(({ id_option, content, correct, feedback }) => ({
        id: id_option,
        content,
        correct,
        feedback: feedback || ""
      }))
    });
  } catch (err) {
    next(err);
  }
}

export async function answer(
  req: Request<{ taskOrder: number; questionOrder: number }>,
  res: Response,
  next: Function
) {
  const { id: idStudent } = req.user!;
  const { taskOrder: taskOrderStr, questionOrder: questionOrderStr } =
    req.params;
  const { idOption, answerSeconds, newAttempt } = req.body as AnswerOptionReq;

  const taskOrder = +taskOrderStr;
  const questionOrder = +questionOrderStr;

  if (isNaN(taskOrder) || taskOrder < 1)
    return res.status(400).json({ message: "Bad taskOrder" });
  if (isNaN(questionOrder) || questionOrder < 1)
    return res.status(400).json({ message: "Bad questionOrder" });
  if (!idOption || idOption < 1)
    return res.status(400).json({ message: "Bad idOption" });

  try {
    await answerPostask(
      idStudent,
      taskOrder,
      questionOrder,
      idOption,
      answerSeconds,
      newAttempt
    );
    res.status(200).json({
      message: `Answered question ${questionOrder} of postask ${taskOrder}`
    });
  } catch (err) {
    next(err);
  }
}
