import { Request, Response } from "express";
import { getLinkByOrder, getTaskLinksCount } from "../../services/link.service";
import {
  getAnswerFromQuestionOfAttempt,
  getQuestionByOrder,
  getTaskStageQuestionsCount
} from "../../services/question.service";
import {
  PretaskLinkResp,
  PretaskQuestionResp,
  PretaskResp
} from "../../types/responses/students.types";
import {
  getOptionById,
  getQuestionOptions
} from "../../services/option.service";
import { AnswerOptionReq } from "../../types/requests/students.types";
import { createAnswer } from "../../services/answer.service";
import {
  getLastQuestionFromTaskStage,
  getQuestionsFromTaskStage,
  getTaskStageByOrder
} from "../../services/taskStage.service";
import {
  createTaskAttempt,
  finishStudTaskAttempts,
  getStudCurrTaskAttempt
} from "../../services/taskAttempt.service";
import { getTaskByOrder } from "../../services/task.service";
import {
  getStudentTaskByOrder,
  upgradeStudentTaskProgress
} from "../../services/studentTask.service";
import { shuffle } from "../../utils";

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
      numQuestions: await getTaskStageQuestionsCount(id_task_stage)
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

export async function getQuestions(
  req: Request<{ taskOrder: number }>,
  res: Response<PretaskQuestionResp[]>,
  next: Function
) {
  const { taskOrder } = req.params;
  try {
    const questionsWithOptions = await getQuestionsFromTaskStage(taskOrder, 1);
    
    questionsWithOptions.sort((a, b) => {
      // move nulls to the end
      if (!a.topic) return 1;
      if (!b.topic) return -1;
      return a.topic.localeCompare(b.topic);
    });
    res.status(200).json(questionsWithOptions);
  } catch (err) {
    next(err);
  }
}

export async function getQuestion(
  req: Request<{ taskOrder: number; questionOrder: number }>,
  res: Response<PretaskQuestionResp>,
  next: Function
) {
  const { taskOrder, questionOrder } = req.params;
  try {
    const { id_question, content, type, img_alt, img_url, topic } =
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
        feedback: feedback || ""
      })),
      topic: topic || null
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
    const task = await getTaskByOrder(taskOrder);

    if (taskOrder !== 1) {
      const { highest_stage } = await getStudentTaskByOrder(
        idStudent,
        taskOrder - 1
      );
      if (highest_stage < 3) {
        return res.status(403).json({
          message: `Student must complete PosTask from task ${taskOrder - 1}`
        });
      }
    }

    // verify question exists
    const question = await getQuestionByOrder(taskOrder, 1, questionOrder);

    // verify option belongs to question
    const option = await getOptionById(idOption);
    if (question.id_question !== option.id_question) {
      return res
        .status(400)
        .json({ message: "Option does not belong to question" });
    }

    // create task attempt if required
    let taskAttempt;
    if (newAttempt) {
      await finishStudTaskAttempts(idStudent);
      taskAttempt = await createTaskAttempt(idStudent, task.id_task, null);
    } else {
      try {
        taskAttempt = await getStudCurrTaskAttempt(idStudent);
      } catch (err) {
        taskAttempt = await createTaskAttempt(idStudent, task.id_task, null);
      }
    }

    if (taskAttempt.id_task !== task.id_task) {
      return res
        .status(400)
        .json({ message: "Current Task attempt is from another task" });
    }

    try {
      await getAnswerFromQuestionOfAttempt(
        taskAttempt.id_task_attempt,
        question.id_question
      );
      return res
        .status(400)
        .json({ message: "Question already answered in this attempt" });
    } catch (err) {}

    await createAnswer(
      question.id_question,
      idOption,
      answerSeconds,
      taskAttempt.id_task_attempt
    );
    res.status(200).json({
      message: `Answered question ${questionOrder} of pretask ${taskOrder}`
    });

    // additional logic to upgrade student_task progress
    // try {
    //   getLastQuestionFromTaskStage(taskOrder, 1)
    //     .then((lastQuestion) => {
    //       if (lastQuestion.id_question === question.id_question) {
    //         upgradeStudentTaskProgress(taskOrder, idStudent, 1).catch((err) => {
    //           console.log(err);
    //         });
    //       }
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // } catch (err) {
    //   console.log(err);
    // }
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
