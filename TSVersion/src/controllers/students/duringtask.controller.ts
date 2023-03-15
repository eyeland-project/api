import { Request, Response } from "express";
import {
  getAnswerFromQuestionOfAttempt,
  getQuestionByOrder,
  getTaskStageQuestionsCount,
} from "../../services/question.service";
import {
  DuringtaskQuestionResp,
  DuringtaskResp,
} from "../../types/responses/students.types";
import {
  getOptionById,
  getQuestionOptions,
} from "../../services/option.service";
import {
  getLastQuestionFromTaskStage,
  getTaskStageByOrder,
} from "../../services/taskStage.service";
import { ApiError } from "../../middlewares/handleErrors";
import {
  createTaskAttempt,
  getStudCurrTaskAttempt,
} from "../../services/taskAttempt.service";
import {
  translateFormat,
  distributeOptions,
  shuffle,
  indexPower,
} from "../../utils";
import {
  getCourseFromStudent,
  getTeamFromStudent,
  getTeammates,
} from "../../services/student.service";
import { OutgoingEvents, Power } from "../../types/enums";
import {
  getMembersFromTeam,
  getTeamById,
  updateTeam,
} from "../../services/team.service";
import { AnswerOptionReq } from "../../types/requests/students.types";
import { createAnswer } from "../../services/answer.service";
import { directory } from "../../listeners/namespaces/students";
import {
  upgradeStudentTaskProgress,
  getStudentTaskByOrder,
} from "../../services/studentTask.service";
import { getTaskByOrder } from "../../services/task.service";

export async function root(
  req: Request<{ taskOrder: number }>,
  res: Response<DuringtaskResp>,
  next: Function
) {
  try {
    const { taskOrder } = req.params;
    const { description, keywords, id_task_stage } = await getTaskStageByOrder(
      taskOrder,
      2
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
    const { id: idStudent } = req.user!;
    // if (!await duringtaskAvailable(idStudent)) throw new ApiError('DuringTask is not available', 400);
    const { taskOrder, questionOrder } = req.params;

    const {
      id_question,
      content,
      type,
      img_alt,
      img_url,
      audio_url,
      video_url,
    } = await getQuestionByOrder(taskOrder, 2, questionOrder);
    let options = await getQuestionOptions(id_question);

    const { nouns, preps } = await translateFormat(content);
    //- const { id_team, power } = await getStudCurrTaskAttempt(idStudent);

    // * If student has no team, send error
    //- if (!id_team || !power){
    //-     throw new ApiError('No team or power found', 400);
    //- }
    //- const members = (await getTeammates(idStudent, {idTeam: id_team})).map(({ task_attempt }) => task_attempt.power);
    //- members.push(power);
    //- members.sort((a, b) => indexPower(a) - indexPower(b));

    // * shuffle options
    //- options = shuffle(options, id_team);
    // * distribute options based on power
    //- options = distributeOptions(options, members.indexOf(power) + 1, members.length);

    res.status(200).json({
      content,
      type,
      id: id_question,
      imgAlt: img_alt || "",
      imgUrl: img_url || "",
      audioUrl: audio_url || "",
      videoUrl: video_url || "",
      nounTranslation: nouns,
      prepositionTranslation: preps,
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
  req: Request<
    { taskOrder: number; questionOrder: number },
    any,
    AnswerOptionReq
  >,
  res: Response,
  next: Function
) {
  const { taskOrder, questionOrder } = req.params;
  const { idOption, answerSeconds } = req.body;
  const { id: idStudent } = req.user!;

  const socket = directory.get(idStudent);
  if (!socket) {
    return res.status(400).json({ message: "Student is not connected" });
  }

  if (taskOrder < 1) return res.status(400).json({ message: "Bad taskOrder" });
  if (questionOrder < 1)
    return res.status(400).json({ message: "Bad questionOrder" });
  if (!idOption || idOption < 1)
    return res.status(400).json({ message: "Bad idOption" });

  try {
    const task = await getTaskByOrder(taskOrder);

    const { session } = await getCourseFromStudent(idStudent);
    if (!session) {
      return res.status(403).json({ message: "Course session not started" });
    }

    const { highest_stage } = await getStudentTaskByOrder(idStudent, taskOrder);
    if (highest_stage < 1) {
      return res.status(403).json({
        message: `Student must complete PreTask from task ${taskOrder}`,
      });
    }

    // - get student's current task attempt and get student's team id from task attempt
    const taskAttempt = await getStudCurrTaskAttempt(idStudent);
    if (!taskAttempt.id_team) {
      return res.status(400).json({ message: "Student is not in a team" });
    }

    if (taskAttempt.id_task !== task.id_task) {
      return res
        .status(400)
        .json({ message: "Current Task attempt is from another task" });
    }

    // - Check if team exists
    await getTeamFromStudent(idStudent);

    // - Check if question exists and is in the correct task stage, and get question_id
    const question = await getQuestionByOrder(
      taskOrder,
      2,
      questionOrder
    );

    // - Check if option exists and is in the correct question
    const option = await getOptionById(idOption);
    if (question.id_question !== option.id_question)
      throw new ApiError("Option does not belong to question", 400);

    try {
      await getAnswerFromQuestionOfAttempt(taskAttempt.id_task_attempt, question.id_question);
      return res.status(400).json({ message: "Question already answered in this attempt" });
    } catch (err) {}
    
    await createAnswer(
      question.id_question,
      idOption,
      answerSeconds,
      taskAttempt.id_task_attempt
    );
    res.status(200).json({ message: "Answered" });

    // additional logic to upgrade student's task progress and do socket stuff
    try {
      socket.broadcast
        .to(`t${taskAttempt.id_team}`)
        .emit(OutgoingEvents.ANSWER, {
          correct: option.correct,
        });
      getLastQuestionFromTaskStage(taskOrder, 2).then((lastQuestion) => {
        if (lastQuestion.id_question === question.id_question) {
          upgradeStudentTaskProgress(taskOrder, idStudent, 2).catch((err) =>
            console.log(err)
          );
          getTeammates(idStudent, { idTeam: taskAttempt.id_team! })
            .then((teammates) => {
              teammates.forEach(({ id_student }) => {
                upgradeStudentTaskProgress(taskOrder, id_student, 2).catch(
                  (err) => console.log(err)
                );
              });
            })
            .catch((err) => console.log(err));

          updateTeam(taskAttempt.id_team!, { active: false }).catch((err) =>
            console.log(err)
          );
        }
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    next(err);
  }
}
