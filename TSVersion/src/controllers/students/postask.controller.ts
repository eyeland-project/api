import { Request, Response } from "express";
import multer from "multer";
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
  canStudentAnswerPostask,
  upgradeStudentTaskProgress,
} from "../../services/studentTask.service";

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

  try {
    const { newAttempt } = req.body as AnswerOptionReq;

    // create task_attempt if required
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

    // verify if student can answer (task_attempt exists, proggres is correct, session is active)
    if (!canStudentAnswerPostask(taskOrder, idStudent)) {
      return res
        .status(403)
        .json({ message: "Student cannot answer this postask" });
    }

    const { type: questionType, id_question } = await getQuestionByOrder(
      taskOrder,
      3,
      questionOrder
    );
    const { answerSeconds, idOption } = req.body as AnswerOptionReq;
      if (!idOption) {
        return res.status(400).json({ message: "Missing idOption" });
      }

			// verify if option belongs to question
      const option = await getOptionById(idOption);
      console.log(id_question, option.id_question);
      
      if (id_question !== option.id_question) {
        return res
          .status(400)
          .json({ message: "Option does not belong to question" });
      }

      await answerQuestion(
        taskOrder,
        3,
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
      const lastQuestion = await getLastQuestionFromTaskStage(taskOrder, 3);
      if (lastQuestion.id_question === id_question) {
        await upgradeStudentTaskProgress(taskOrder, idStudent, 3);
        updateStudCurrTaskAttempt(idStudent, { active: false });
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    next(err);
  }
}
