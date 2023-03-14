import { Request, Response } from "express";
import {
  getQuestionByOrder,
  getTaskStageQuestionsCount,
} from "../../services/question.service";
import {
  DuringtaskQuestionResp,
  PostaskResp,
} from "../../types/responses/students.types";
import {
  getOptionById,
  getQuestionOptions,
} from "../../services/option.service";
import { answerQuestion } from "../../services/answer.service";
import {
  AnswerAudioReq,
  AnswerOptionReq,
} from "../../types/requests/students.types";
import {
  getLastQuestionFromTaskStage,
  getTaskStageByOrder,
} from "../../services/taskStage.service";
import {
  createTaskAttempt,
  finishStudTaskAttempts,
  getStudCurrTaskAttempt,
  updateStudCurrTaskAttempt,
} from "../../services/taskAttempt.service";
import { getTaskByOrder } from "../../services/task.service";
import {
  getStudentTaskByOrder,
  upgradeStudentTaskProgress,
} from "../../services/studentTask.service";
import { getCourseFromStudent } from "../../services/student.service";

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
      numQuestions: await getTaskStageQuestionsCount(id_task_stage),
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
      video_url,
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
  const { answerSeconds, idOption, newAttempt } = req.body as AnswerOptionReq;

  if (taskOrder < 1) return res.status(400).json({ message: "Bad taskOrder" });
  if (questionOrder < 1)
    return res.status(400).json({ message: "Bad questionOrder" });
  if (!idOption || idOption < 1)
    return res.status(400).json({ message: "Bad idOption" });

  try {
    // create task_attempt if required
    const task = await getTaskByOrder(taskOrder);

    const { session } = await getCourseFromStudent(idStudent);
    if (!session) {
      return res.status(403).json({ message: "Course session not started" });
    }

    const { highest_stage } = await getStudentTaskByOrder(idStudent, taskOrder);
    if (highest_stage < 2) {
      return res.status(403).json({
        message: `Student must complete DuringTask from task ${taskOrder}`,
      });
    }

    // verify question exists
    const question = await getQuestionByOrder(taskOrder, 3, questionOrder);

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

    await answerQuestion(
      taskOrder,
      3,
      questionOrder,
      idOption,
      answerSeconds,
      taskAttempt.id_task_attempt
    );
    res.status(200).json({
      message: `Answered question ${questionOrder} of task ${taskOrder}`,
    });

    // additional logic to upgrade student_task progress
    try {
      getLastQuestionFromTaskStage(taskOrder, 3).then(async (lastQuestion) => {
        if (lastQuestion.id_question === question.id_question) {
          upgradeStudentTaskProgress(taskOrder, idStudent, 3);
          updateStudCurrTaskAttempt(idStudent, { active: false });
        }
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    next(err);
  }
}
