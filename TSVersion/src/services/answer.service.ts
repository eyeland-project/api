import { Op } from "sequelize";
import { directory as dirStudents } from "@listeners/namespaces/student";
import { ApiError } from "@middlewares/handleErrors";
import { AnswerModel, QuestionModel, TaskModel } from "@models";
import { Answer } from "@interfaces/Answer.types";
import { OutgoingEvents } from "@interfaces/enums/socket.enum";
import { updateLeaderBoard } from "@services/leaderBoard.service";
import { getOptionById } from "@services/option.service";
import { getQuestionByOrder } from "@services/question.service";
import {
  getCourseFromStudent,
  getTeamFromStudent,
  getTeammates
} from "@services/student.service";
import {
  getStudentTaskByOrder,
  upgradeStudentTaskProgress
} from "@services/studentTask.service";
import {
  createTaskAttempt,
  finishStudentTaskAttempts,
  getCurrTaskAttempt,
  updateCurrTaskAttempt
} from "@services/taskAttempt.service";
import { getLastQuestionFromTaskStage } from "@services/taskStage.service";
import { getMembersFromTeam, updateTeam } from "@services/team.service";
import * as repositoryService from "@services/repository.service";
import { getStorageBucket } from "@config/storage";
import { format } from "util";

export async function answerPretask(
  idStudent: number,
  taskOrder: number,
  questionOrder: number,
  idOption: number,
  newAttempt?: boolean | null,
  answerSeconds?: number
): Promise<void> {
  const task = await repositoryService.findOne<TaskModel>(TaskModel, {
    where: {
      task_order: taskOrder
    }
  });

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
    await finishStudentTaskAttempts(idStudent);
    taskAttempt = await createTaskAttempt(idStudent, task.id_task, null);
  } else {
    try {
      taskAttempt = await getCurrTaskAttempt(idStudent);
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

  await AnswerModel.create({
    id_question: question.id_question,
    id_task_attempt: taskAttempt.id_task_attempt,
    id_option: idOption,
    answer_seconds: answerSeconds,
    id_team: null
  });
}

export async function answerDuringtask(
  idStudent: number,
  taskOrder: number,
  questionOrder: number,
  idOption: number,
  answerSeconds?: number
): Promise<{ alreadyAnswered: boolean; nextQuestionOrder: number }> {
  const socket = dirStudents.get(idStudent);
  if (!socket) {
    throw new ApiError("Student is not connected", 400);
  }

  const task = await repositoryService.findOne<TaskModel>(TaskModel, {
    where: { task_order: taskOrder }
  });

  const { session, id_course } = await getCourseFromStudent(idStudent);
  if (!session) {
    throw new ApiError("Course session not started", 403);
  }

  const { highest_stage } = await getStudentTaskByOrder(idStudent, taskOrder);
  if (highest_stage < 1) {
    throw new ApiError(
      `Student must complete PreTask from task ${taskOrder}`,
      403
    );
  }

  // - get student's current task attempt and get student's team id from task attempt
  const taskAttempt = await getCurrTaskAttempt(idStudent);
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
    idsTaskAttempts = teamMembers.map(({ task_attempt: { id } }) => id);
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
      // attributes: ["question_order"],
      as: "question"
    }
  });

  let nextQuestionOrder: number;

  const answered = anwersSession.find(
    ({ id_question }) => id_question === question.id_question
  );
  if (answered) {
    // if question was already answered
    const highestAnsweredQuestionOrder = Math.max(
      ...anwersSession.map(({ question }) => question.question_order)
    );
    nextQuestionOrder = highestAnsweredQuestionOrder + 1;
  } else {
    await AnswerModel.create({
      id_question: question.id_question,
      id_task_attempt: taskAttempt.id_task_attempt,
      id_option: idOption,
      answer_seconds: answerSeconds,
      id_team: taskAttempt.id_team
    });
    nextQuestionOrder = questionOrder + 1;
  }

  // additional logic to upgrade student's task progress and do socket stuff
  new Promise(async () => {
    // * Updating Leaderboard
    updateLeaderBoard(id_course).catch((err) => console.log(err));

    socket.broadcast.to(`t${taskAttempt.id_team}`).emit(OutgoingEvents.ANSWER, {
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
  }).catch((err) => console.log(err));

  return {
    alreadyAnswered: !!answered,
    nextQuestionOrder
  };
}

export async function answerPostask(
  idStudent: number,
  taskOrder: number,
  questionOrder: number,
  idOption?: number,
  newAttempt?: boolean | null,
  answerSeconds?: number,
  audio?: Express.Multer.File
): Promise<void> {
  if (idOption === undefined && audio === undefined) {
    throw new ApiError("Must provide an answer", 400);
  }

  // create task_attempt if required
  const { id_task } = await repositoryService.findOne<TaskModel>(TaskModel, {
    where: {
      task_order: taskOrder
    }
  });

  const { session } = await getCourseFromStudent(idStudent);
  if (!session) {
    throw new ApiError("Course session not created", 403);
  }

  const { highest_stage } = await getStudentTaskByOrder(idStudent, taskOrder);
  if (highest_stage < 2) {
    throw new ApiError(
      `Student must complete DuringTask from task ${taskOrder}`,
      403
    );
  }

  // verify question exists
  const { id_question } = await getQuestionByOrder(taskOrder, 3, questionOrder);

  // verify option belongs to question
  if (idOption !== undefined) {
    const option = await getOptionById(idOption);
    if (id_question !== option.id_question) {
      throw new ApiError("Option does not belong to question", 400);
    }
  }

  // create task attempt if required
  let taskAttempt;
  if (newAttempt) {
    await finishStudentTaskAttempts(idStudent);
    taskAttempt = await createTaskAttempt(idStudent, id_task, null);
  } else {
    try {
      taskAttempt = await getCurrTaskAttempt(idStudent);
    } catch (err) {
      taskAttempt = await createTaskAttempt(idStudent, id_task, null);
    }
  }

  if (taskAttempt.id_task !== id_task) {
    throw new ApiError("Current Task attempt is from another task", 400);
  }

  try {
    await AnswerModel.findOne({
      where: {
        id_task_attempt: taskAttempt.id_task_attempt,
        id_question: id_question
      }
    });
    throw new ApiError("Question already answered in this attempt", 400);
  } catch (err) {}

  const { id_answer } = await AnswerModel.create({
    id_question,
    id_task_attempt: taskAttempt.id_task_attempt,
    id_option: idOption,
    answer_seconds: answerSeconds,
    id_team: null
  });

  // if (audio) {
  //   try {
  //     await uploadAudio(audio, id_answer);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  new Promise(() => {
    getLastQuestionFromTaskStage(taskOrder, 3).then((lastQuestion) => {
      if (lastQuestion.id_question === id_question) {
        upgradeStudentTaskProgress(taskOrder, idStudent, 3);
        updateCurrTaskAttempt(idStudent, { active: false });
      }
    });
  }).catch((err) => console.log(err));
}

async function uploadAudio(
  audio: Express.Multer.File,
  id_answer: number
): Promise<{ message: string; url: string }> {
  return new Promise((resolve) => {
    const bucket = getStorageBucket();
    const blob = bucket.file(audio.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true
    });

    blobStream.on("error", (err) => {
      throw new ApiError(err.message, 500);
    });

    blobStream.on("finish", async () => {
      // Create URL for directly file access via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );

      try {
        // Make the file public
        await bucket.file(audio.originalname).makePublic();
        blobStream.end(audio.buffer);
        resolve({
          message: "Uploaded the file successfully: " + audio.originalname,
          url: publicUrl
        });
      } catch {
        blobStream.end(audio.buffer);
        resolve({
          message: `Uploaded the file successfully: ${audio.originalname}, but public access is denied!`,
          url: publicUrl
        });
      }
    });
  });
}
