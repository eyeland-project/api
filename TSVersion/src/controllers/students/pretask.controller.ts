import { Request, Response } from "express";
import { getLinkByOrder, getTaskLinksCount } from "../../services/link.service";
import {
  getQuestionByOrder,
  getTaskStageQuestionsCount,
} from "../../services/question.service";
import {
  PretaskLinkResp,
  PretaskQuestionResp,
  PretaskResp,
} from "../../types/responses/students.types";
import {
  getOptionById,
  getQuestionOptions,
} from "../../services/option.service";
import { AnswerOptionReq } from "../../types/requests/students.types";
import { answerQuestion } from "../../services/answer.service";
import {
  getLastQuestionFromTaskStage,
  getTaskStageByOrder,
} from "../../services/taskStage.service";
import {
  createTaskAttempt,
  finishStudTaskAttempts,
  getStudCurrTaskAttempt,
} from "../../services/taskAttempt.service";
import { getTaskByOrder } from "../../services/task.service";
import {
  canStudentAnswerPretask,
  upgradeStudentTaskProgress,
} from "../../services/studentTask.service";

export async function root(
  req: Request<{ taskOrder: number }>,
  res: Response<PretaskResp>,
  next: Function
) {
  try {
    const { taskOrder } = req.params;
    const { description, keywords, id_task, id_task_stage } =
      await getTaskStageByOrder(taskOrder, 1);
    res.status(200).json({
      description: description,
      keywords: keywords,
      numLinks: await getTaskLinksCount(id_task),
      numQuestions: await getTaskStageQuestionsCount(id_task_stage),
    });
  } catch (err) {
    next(err);
  }
}

export async function getLink(
  req: Request<{ taskOrder: number; linkOrder: number }>,
  res: Response<PretaskLinkResp>,
  next: Function
) {
  try {
    const { taskOrder, linkOrder } = req.params;
    const { id_link, topic, url } = await getLinkByOrder(taskOrder, linkOrder);
    res.status(200).json({ id: id_link, topic, url });
  } catch (err) {
    next(err);
  }
}

export async function getQuestion(
  req: Request<{ taskOrder: number; questionOrder: number }>,
  res: Response<PretaskQuestionResp>,
  next: Function
) {
  try {
    const { taskOrder, questionOrder } = req.params;

    const { id_question, content, type, img_alt, img_url } =
      await getQuestionByOrder(taskOrder, 1, questionOrder);
    const options = await getQuestionOptions(id_question);

    res.status(200).json({
      content,
      type,
      id: id_question,
      imgAlt: img_alt || "",
      imgUrl: img_url || "",
      options: options.map(({ id_option, content, correct, feedback }) => ({
        id: id_option,
        content,
        correct,
        feedback: feedback || "",
      })),
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
  const { taskOrder, questionOrder } = req.params;
  const { idOption, answerSeconds, newAttempt } = req.body as AnswerOptionReq;

  try {
    if (!idOption) return res.status(400).json({ message: "Missing idOption" });

    // create task attempt if required
    let idTaskAttempt;
    if (newAttempt) {
      await finishStudTaskAttempts(idStudent);
      const { id_task } = await getTaskByOrder(taskOrder);
      idTaskAttempt = (await createTaskAttempt(idStudent, id_task, null))
        .id_task_attempt;
    } else {
      try {
        idTaskAttempt = (await getStudCurrTaskAttempt(idStudent))
          .id_task_attempt;
      } catch (err) {
        const { id_task } = await getTaskByOrder(taskOrder);
        idTaskAttempt = (await createTaskAttempt(idStudent, id_task, null))
          .id_task_attempt;
      }
    }

    // verify student can answer (task_attempt is active, progress is correct)
    if (!canStudentAnswerPretask(taskOrder, idStudent)) {
      return res
        .status(403)
        .json({ message: "Student cannot answer this pretask" });
    }

    // verify question exists
    const { id_question } = await getQuestionByOrder(
      taskOrder,
      1,
      questionOrder
    );

    // verify option belongs to question
    const option = await getOptionById(idOption);
    if (id_question !== option.id_question) {
      return res
        .status(400)
        .json({ message: "Option does not belong to question" });
    }
    await answerQuestion(
      taskOrder,
      1,
      questionOrder,
      idOption,
      answerSeconds,
      idTaskAttempt
    );
    res.status(200).json({
      message: `Answered question ${questionOrder} of task ${taskOrder}`,
    });

    // additional logic to upgrade student_task progress
    try {
      const lastQuestion = await getLastQuestionFromTaskStage(taskOrder, 1);
      if (lastQuestion.id_question === id_question) {
        await upgradeStudentTaskProgress(taskOrder, idStudent, 1);
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    next(err);
  }
}

export async function setCompleted(
  req: Request<{ taskOrder: number }>,
  res: Response,
  next: Function
) {
  try {
    const { id: idStudent } = req.user!;
    const { taskOrder } = req.params;
    await upgradeStudentTaskProgress(taskOrder, idStudent, 1);
    res.status(200).json({ message: `Completed pretask ${taskOrder}` });
  } catch (err) {
    next(err);
  }
}
