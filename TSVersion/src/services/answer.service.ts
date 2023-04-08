import { Op } from "sequelize";
import { directory as dirStudents } from "../listeners/namespaces/students";
import { ApiError } from "../middlewares/handleErrors";
import { AnswerModel, QuestionModel } from "../models";
import { Answer } from "../types/Answer.types";
import { OutgoingEvents } from "../types/enums";
import { updateLeaderBoard } from "./leaderBoard.service";
import { getOptionById } from "./option.service";
import { getQuestionByOrder } from "./question.service";
import {
  getCourseFromStudent,
  getTeamFromStudent,
  getTeammates
} from "./student.service";
import {
  getStudentTaskByOrder,
  upgradeStudentTaskProgress
} from "./studentTask.service";
import { getTaskByOrder } from "./task.service";
import {
  createTaskAttempt,
  finishStudTaskAttempts,
  getStudCurrTaskAttempt,
  updateStudCurrTaskAttempt
} from "./taskAttempt.service";
import { getLastQuestionFromTaskStage } from "./taskStage.service";
import { getMembersFromTeam, updateTeam } from "./team.service";

export async function answerPretask(
  idStudent: number,
  taskOrder: number,
  questionOrder: number,
  idOption: number,
  answerSeconds: number,
  newAttempt: boolean | null | undefined
): Promise<void> {
  const task = await getTaskByOrder(taskOrder);

  if (taskOrder !== 1) {
    const { highest_stage } = await getStudentTaskByOrder(
      idStudent,
      taskOrder - 1
    );
    if (highest_stage < 3) {
      throw new ApiError(
        `Student must complete PosTask from task ${taskOrder - 1}`,
        403
      );
    }
  }

  // verify question exists
  const question = await getQuestionByOrder(taskOrder, 1, questionOrder);

  // verify option belongs to question
  const option = await getOptionById(idOption);
  if (question.id_question !== option.id_question) {
    throw new ApiError("Option does not belong to question", 400);
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
    throw new ApiError("Current Task attempt is from another task", 400);
  }

  try {
    await AnswerModel.findOne({
      where: {
        id_task_attempt: taskAttempt.id_task_attempt,
        id_question: question.id_question
      }
    });
    throw new ApiError("Question already answered in this attempt", 400);
  } catch (err) {}

  await createAnswer(
    question.id_question,
    idOption,
    answerSeconds,
    taskAttempt.id_task_attempt
  );
}

export async function answerDuringtask(
  idStudent: number,
  taskOrder: number,
  questionOrder: number,
  idOption: number,
  answerSeconds: number
): Promise<{alreadyAnswered: boolean, nextQuestionOrder: number}> {
  return new Promise(async (resolve, reject) => {
    try {
      const socket = dirStudents.get(idStudent);
      if (!socket) {
        throw new ApiError("Student is not connected", 400);
      }

      const task = await getTaskByOrder(taskOrder);

      const { session, id_course } = await getCourseFromStudent(idStudent);
      if (!session) {
        throw new ApiError("Course session not started", 403);
      }

      const { highest_stage } = await getStudentTaskByOrder(
        idStudent,
        taskOrder
      );
      if (highest_stage < 1) {
        throw new ApiError(
          `Student must complete PreTask from task ${taskOrder}`,
          403
        );
      }

      // - get student's current task attempt and get student's team id from task attempt
      const taskAttempt = await getStudCurrTaskAttempt(idStudent);
      if (!taskAttempt.id_team) {
        throw new ApiError("Student is not in a team", 400);
      }

      if (taskAttempt.id_task !== task.id_task) {
        throw new ApiError("Current Task attempt is from another task", 400);
      }

      // - Check if team exists
      await getTeamFromStudent(idStudent);

      // - Check if question exists and is in the correct task stage, and get question_id
      const question = await getQuestionByOrder(taskOrder, 2, questionOrder);

      // - Check if option exists and is in the correct question
      const option = await getOptionById(idOption);
      if (question.id_question !== option.id_question) {
        throw new ApiError("Option does not belong to question", 400);
      }

      let idsTaskAttempts: number[];
      try {
        const teamMembers = await getMembersFromTeam({
          idTeam: taskAttempt.id_team
        });
        idsTaskAttempts = teamMembers.map((member) => member.task_attempt.id);
      } catch (err) {
        idsTaskAttempts = [taskAttempt.id_task_attempt];
      }

      const anwersSession = await AnswerModel.findAll({
        where: {
          [Op.or]: idsTaskAttempts.map((id) => ({
            id_task_attempt: id
          }))
        },
        include: {
          model: QuestionModel,
          attributes: ['question_order'],
          as: 'question'
        }
      });
      
      let nextQuestionOrder: number;
      
      const answered = anwersSession.find(
        ({ id_question }) => id_question === question.id_question
      );
      if (answered) { // if question was already answered
        nextQuestionOrder = answered.question.question_order + 1;
      } else {
        await createAnswer(
          question.id_question,
          idOption,
          answerSeconds,
          taskAttempt.id_task_attempt,
          taskAttempt.id_team
        );
        nextQuestionOrder = questionOrder + 1;
      }
      
      resolve({
        alreadyAnswered: !!answered,
        nextQuestionOrder
      });
      // additional logic to upgrade student's task progress and do socket stuff
      try {
        // * Updating Leaderboard
        updateLeaderBoard(id_course).catch((err) => console.log(err));

        socket.broadcast
          .to(`t${taskAttempt.id_team}`)
          .emit(OutgoingEvents.ANSWER, {
            correct: option.correct,
            nextQuestion: questionOrder + 1
          });
        console.log("answer emitted to team", taskAttempt.id_team);

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

            updateTeam(taskAttempt.id_team!, {
              active: false,
              playing: false
            }).catch((err) => console.log(err));
          }
        });
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export async function answerPostask(
  idStudent: number,
  taskOrder: number,
  questionOrder: number,
  idOption: number,
  answerSeconds: number,
  newAttempt: boolean | undefined | null
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      // create task_attempt if required
      const task = await getTaskByOrder(taskOrder);

      const { session } = await getCourseFromStudent(idStudent);
      if (!session) {
        throw new ApiError("Course session not started", 403);
      }

      const { highest_stage } = await getStudentTaskByOrder(
        idStudent,
        taskOrder
      );
      if (highest_stage < 2) {
        throw new ApiError(
          `Student must complete DuringTask from task ${taskOrder}`,
          403
        );
      }

      // verify question exists
      const question = await getQuestionByOrder(taskOrder, 3, questionOrder);

      // verify option belongs to question
      const option = await getOptionById(idOption);
      if (question.id_question !== option.id_question) {
        throw new ApiError("Option does not belong to question", 400);
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
        throw new ApiError("Current Task attempt is from another task", 400);
      }

      try {
        await AnswerModel.findOne({
          where: {
            id_task_attempt: taskAttempt.id_task_attempt,
            id_question: question.id_question
          }
        });
        throw new ApiError("Question already answered in this attempt", 400);
      } catch (err) {}

      await createAnswer(
        question.id_question,
        idOption,
        answerSeconds,
        taskAttempt.id_task_attempt
      );
      resolve();

      // additional logic to upgrade student_task progress
      try {
        getLastQuestionFromTaskStage(taskOrder, 3).then((lastQuestion) => {
          if (lastQuestion.id_question === question.id_question) {
            upgradeStudentTaskProgress(taskOrder, idStudent, 3);
            updateStudCurrTaskAttempt(idStudent, { active: false });
          }
        });
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export async function createAnswer(
  idQuestion: number,
  idOption: number,
  answerSeconds: number,
  idTaskAttempt: number,
  idTeam?: number
): Promise<Answer> {
  return await AnswerModel.create({
    id_question: idQuestion,
    id_task_attempt: idTaskAttempt,
    id_option: idOption,
    answer_seconds: answerSeconds,
    id_team: idTeam ?? null
  });
}
