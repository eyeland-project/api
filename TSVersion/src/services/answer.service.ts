import { Op } from "sequelize";
import { directory as dirStudents } from "@listeners/namespaces/student";
import { ApiError } from "@middlewares/handleErrors";
import {
  AnswerModel,
  GradeAnswerModel,
  OptionModel,
  QuestionModel,
  StudentTaskModel,
  TaskAttemptModel,
  TaskModel,
  TaskStageModel,
  TeamModel
} from "@models";
import { OutgoingEvents } from "@interfaces/enums/socket.enum";
import { updateLeaderBoard } from "@services/leaderBoard.service";
import { getOptionById } from "@services/option.service";
import { getQuestionsFromTaskStage } from "@services/question.service";
import { getCourseFromStudent } from "@services/student.service";
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
import { getMembersFromTeam, updateTeam } from "@services/team.service";
import * as repositoryService from "@services/repository.service";
import { getStorageBucket } from "@config/storage";
import { format } from "util";
import {
  AnswerOpenCreateDto,
  AnswerSelectSpeakingCreateDto
} from "@dto/student/answer.dto";
import { getLastQuestionFromTaskStage } from "./taskStage.service";
import {
  QuestionSubmissionDetailDuringtaskDto,
  QuestionSubmissionDetailPostaskDto,
  QuestionSubmissionDetailPretaskDto
} from "@dto/teacher/answer.dto";
import { separateTranslations } from "@utils";

export async function answerPretask(
  idStudent: number,
  taskOrder: number,
  questionOrder: number,
  idOption: number,
  newAttempt?: boolean | null,
  answerSeconds?: number
): Promise<void> {
  const { id_task } = await repositoryService.findOne<TaskModel>(TaskModel, {
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
  const question = (
    await getQuestionsFromTaskStage(
      { idTask: id_task },
      1,
      { question_order: questionOrder },
      { limit: 1 }
    )
  )[0];
  if (!question) {
    throw new ApiError("Question does not exist", 400);
  }

  // verify option belongs to question
  if (idOption !== undefined) {
    if (!question.options.some(({ id }) => id === idOption)) {
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
        id_question: question.id
      }
    });
    throw new ApiError("Question already answered in this attempt", 400);
  } catch (err) {}

  await AnswerModel.create({
    id_question: question.id,
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
): Promise<{ alreadyAnswered: boolean }> {
  const socket = dirStudents.get(idStudent);
  if (!socket) {
    throw new ApiError("Student is not connected", 400);
  }

  // - get student's current task attempt and get student's team id from task attempt
  const taskAttempt = await getCurrTaskAttempt(idStudent);

  // - Check if team exists
  // await getTeamFromStudent(idStudent);
  if (taskAttempt.id_team === null || taskAttempt.id_team === undefined) {
    throw new ApiError("Student is not in a team", 400);
  }

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

  const questionsFromStage = await repositoryService.findAll<QuestionModel>(
    QuestionModel,
    {
      attributes: ["id_question", "question_order"],
      include: [
        {
          model: TaskStageModel,
          attributes: ["id_task"],
          as: "taskStage",
          where: {
            task_stage_order: 2,
            id_task: taskAttempt.id_task
          }
        },
        {
          model: AnswerModel,
          as: "answers",
          attributes: ["id_answer"],
          where: { id_team: taskAttempt.id_team },
          required: false
        }
      ]
    }
  );

  const question = questionsFromStage.find(
    (q) => q.question_order === questionOrder
  );
  if (!question) {
    throw new ApiError("Question not found", 400);
  }

  // - Check if option exists and is in the correct question
  const option = await getOptionById(idOption);
  if (question.id_question !== option.id_question) {
    throw new ApiError("Option does not belong to question", 400);
  }

  const prevCorrectAnswers = await repositoryService.findAll<AnswerModel>(
    AnswerModel,
    {
      attributes: ["id_answer"],
      where: { id_team: taskAttempt.id_team },
      include: [
        {
          model: OptionModel,
          attributes: ["id_option"],
          as: "option",
          where: { correct: true }
        },
        {
          model: QuestionModel,
          attributes: ["id_question"],
          as: "question"
        }
      ]
    }
  );

  const missingQuestions = questionsFromStage.filter(
    (ques) =>
      !prevCorrectAnswers.find(
        (answer) => answer.question.id_question === ques.id_question
      ) && ques.id_question !== question.id_question
  );

  if (
    prevCorrectAnswers.find(
      (answer) => answer.question.id_question === question.id_question
    )
  ) {
    return { alreadyAnswered: true };
  } else {
    await AnswerModel.create({
      id_question: question.id_question,
      id_task_attempt: taskAttempt.id_task_attempt,
      id_option: idOption,
      answer_seconds: answerSeconds,
      id_team: taskAttempt.id_team
    });
  }

  // additional logic to upgrade student's task progress and do socket stuff
  new Promise(async () => {
    socket.broadcast.to(`t${taskAttempt.id_team}`).emit(OutgoingEvents.ANSWER, {
      correct: option.correct
    });
    console.log("answer emitted to team", taskAttempt.id_team);

    // * Updating Leaderboard
    updateLeaderBoard(id_course).catch(console.log);

    const numCorrectAnswers = prevCorrectAnswers.length + +option.correct;
    if (
      missingQuestions.every((q) => q.answers.length >= 1) && //? podría ser sub[0]
      numCorrectAnswers >= questionsFromStage.length - 1 &&
      ((option.correct &&
        missingQuestions.every(
          //? podría ser sub[0]
          (q) => q.answers.length >= question.answers.length + 1
        )) ||
        !option.correct)
    ) {
      // students must answer n-1 questions correctly to finish the task
      getMembersFromTeam({
        idTeam: taskAttempt.id_team!
      }).then((members) => {
        repositoryService.update<StudentTaskModel>(
          StudentTaskModel,
          { highest_stage: 2 },
          {
            where: {
              id_student: {
                [Op.in]: members.map(({ id_student }) => id_student)
              },
              id_task: taskAttempt.id_task,
              highest_stage: { [Op.lt]: 3 }
            }
          }
        );
      });

      updateTeam(taskAttempt.id_team!, {
        active: false,
        playing: false
      }).catch(console.log);
    }
  }).catch(console.log);

  return { alreadyAnswered: false };
}

export async function answerPostask(
  idStudent: number,
  taskOrder: number,
  questionOrder: number,
  body: AnswerSelectSpeakingCreateDto | AnswerOpenCreateDto,
  audio?: Express.Multer.File
): Promise<string | null> {
  // const { answerSeconds, newAttempt } = body;
  const answerSeconds = parseInt(String(body.answerSeconds));
  const newAttempt = String(body.newAttempt) === "true";

  const { session } = await getCourseFromStudent(idStudent);
  if (!session) {
    throw new ApiError("Course session not created", 403);
  }

  // create task_attempt if required
  const { id_task } = await repositoryService.findOne<TaskModel>(TaskModel, {
    where: { task_order: taskOrder }
  });

  const { highest_stage } = await getStudentTaskByOrder(idStudent, taskOrder);
  if (highest_stage < 2) {
    throw new ApiError(
      `Student must complete DuringTask from task ${taskOrder}`,
      403
    );
  }

  // verify question exists
  const question = (
    await getQuestionsFromTaskStage(
      { idTask: id_task },
      3,
      { question_order: questionOrder },
      { limit: 1 }
    )
  )[0];
  if (!question) {
    throw new ApiError("Question does not exist", 400);
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

  const answerSelectSpeaking = <AnswerSelectSpeakingCreateDto>body;
  const idOption = parseInt(String(answerSelectSpeaking.idOption));

  let result;
  if (idOption !== undefined) {
    result = await answerPostaskSelectSpeaking({
      idQuestion: question.id,
      options: question.options,
      idOption,
      idTaskAttempt: taskAttempt.id_task_attempt,
      answerSeconds,
      audio
    });
  } else {
    const { text } = <AnswerOpenCreateDto>body;
    result = await answerPostaskOpen({
      idQuestion: question.id,
      idTaskAttempt: taskAttempt.id_task_attempt,
      text,
      answerSeconds,
      audio
    });
  }

  new Promise(() => {
    getLastQuestionFromTaskStage(taskOrder, 3).then((lastQuestion) => {
      if (lastQuestion.id_question === question.id) {
        upgradeStudentTaskProgress(taskOrder, idStudent, 3);
        updateCurrTaskAttempt(idStudent, { active: false });
      }
    });
  }).catch(console.log);

  return result;
}

export async function answerPostaskSelectSpeaking({
  idQuestion,
  options,
  idOption,
  idTaskAttempt,
  answerSeconds,
  audio
}: {
  idQuestion: number;
  options: { id: number }[];
  idOption?: number;
  idTaskAttempt: number;
  answerSeconds?: number;
  audio?: Express.Multer.File;
}) {
  if (idOption === undefined && audio === undefined) {
    throw new ApiError("Must provide an answer", 400);
  }

  // verify option belongs to question
  if (idOption !== undefined) {
    if (!options.some(({ id }) => id === idOption)) {
      throw new ApiError("Option does not belong to question", 400);
    }
  }

  let uploadResult: { message: string; url: string } | undefined = undefined;
  if (audio) {
    try {
      uploadResult = await uploadAudio(audio);
      console.log(uploadResult.message);
    } catch (err) {
      console.log(err);
    }
  }
  await AnswerModel.create({
    id_question: idQuestion,
    id_task_attempt: idTaskAttempt,
    id_option: idOption,
    answer_seconds: answerSeconds,
    id_team: null,
    audio_url: uploadResult?.url || null
  });

  return uploadResult?.message || null;
}

export async function answerPostaskOpen({
  idQuestion,
  idTaskAttempt,
  text,
  answerSeconds,
  audio
}: {
  idQuestion: number;
  idTaskAttempt: number;
  text?: string;
  answerSeconds?: number;
  audio?: Express.Multer.File;
}): Promise<string | null> {
  if (text === undefined && audio === undefined) {
    throw new ApiError("Must provide an answer", 400);
  }

  if (text !== undefined) {
    await AnswerModel.create({
      id_question: idQuestion,
      id_task_attempt: idTaskAttempt,
      text: text,
      answer_seconds: answerSeconds,
      id_team: null,
      audio_url: null
    });
  } else if (audio !== undefined) {
    let uploadResult: { message: string; url: string } | undefined = undefined;
    try {
      uploadResult = await uploadAudio(audio);
      console.log(uploadResult.message);
    } catch (err) {
      console.log(err);
    }
    await AnswerModel.create({
      id_question: idQuestion,
      id_task_attempt: idTaskAttempt,
      answer_seconds: answerSeconds,
      id_team: null,
      audio_url: uploadResult?.url || null
    });

    return uploadResult?.message || null;
  }
  return null;
}

async function uploadAudio(
  audio: Express.Multer.File
): Promise<{ message: string; url: string }> {
  return new Promise((resolve, reject) => {
    const bucket = getStorageBucket();
    const name = `user_content/learning/submission/audio/${`${new Date().getTime()}_${
      audio.originalname
    }`}`;
    const blob = bucket.file(name);
    const blobStream = blob.createWriteStream({
      resumable: false
    });

    blobStream.on("error", (err) => {
      reject(new ApiError(err.message, 500));
    });

    blobStream.on("finish", async () => {
      // Create URL for directly file access via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${name}`
      );

      resolve({
        message: "Uploaded the file successfully: " + audio.originalname,
        url: publicUrl
      });
    });

    blobStream.end(audio.buffer);
  });
}

export async function getAnswersFromPretaskForTeacher(
  idTeacher: number,
  idCourse: number,
  idTaskAttempt: number
): Promise<QuestionSubmissionDetailPretaskDto[]> {
  return await getAnswersFromTaskStageForTeacher(
    idTeacher,
    idCourse,
    idTaskAttempt,
    1
  );
}

export async function getAnswersFromDuringtaskForTeacher(
  idTeacher: number,
  idCourse: number,
  idTaskAttempt: number
): Promise<QuestionSubmissionDetailDuringtaskDto[]> {
  return (
    await getAnswersFromTaskStageForTeacher(
      idTeacher,
      idCourse,
      idTaskAttempt,
      2
    )
  ).map(({ content, ...fields }) => {
    const {
      memoryPro: nouns,
      superRadar: preps,
      content: contentParsed
    } = separateTranslations(content);
    return {
      ...fields,
      content: contentParsed,
      memoryPro: nouns,
      superRadar: preps
    };
  });
}

export async function getAnswersFromPostaskForTeacher(
  idTeacher: number,
  idCourse: number,
  idTaskAttempt: number
): Promise<QuestionSubmissionDetailPostaskDto[]> {
  return await getAnswersFromTaskStageForTeacher(
    idTeacher,
    idCourse,
    idTaskAttempt,
    3
  );
}

async function getAnswersFromTaskStageForTeacher(
  idTeacher: number,
  idCourse: number,
  idTaskAttempt: number,
  taskStageOrder: number
): Promise<QuestionSubmissionDetailPretaskDto[]> {
  const { id_task, id_team } =
    await repositoryService.findOne<TaskAttemptModel>(TaskAttemptModel, {
      where: { id_task_attempt: idTaskAttempt }
    });
  const questions = await repositoryService.findAll<QuestionModel>(
    QuestionModel,
    {
      include: [
        {
          model: TaskStageModel,
          as: "taskStage",
          attributes: [],
          where: { task_stage_order: taskStageOrder, id_task }
        },
        {
          model: OptionModel,
          as: "options",
          required: false
        },
        {
          model: AnswerModel,
          as: "answers",
          where: { [Op.or]: [{ id_team }, { id_task_attempt: idTaskAttempt }] },
          attributes: [
            "id_answer",
            "id_option",
            "text",
            "audio_url",
            "answer_seconds"
          ],
          include: [
            {
              model: TeamModel,
              as: "team",
              attributes: ["id_team", "name"],
              required: false
            },
            {
              model: GradeAnswerModel,
              as: "gradeAnswer",
              attributes: ["id_grade_answer", "grade", "comment"],
              where: { id_teacher: idTeacher },
              required: false
            }
          ]
        }
      ]
    }
  );

  return questions.map(
    ({
      id_question,
      question_order,
      content,
      type,
      topic,
      img_alt,
      img_url,
      audio_url,
      video_url,
      hint,
      character,
      options,
      answers
    }) => ({
      id: id_question,
      questionOrder: question_order,
      content,
      type,
      topic: topic || null,
      imgAlt: img_alt || null,
      imgUrl: img_url || null,
      audioUrl: audio_url || null,
      videoUrl: video_url || null,
      hint: hint || null,
      character: character || null,
      options: options.map(({ id_option, content, correct, feedback }) => ({
        id: id_option,
        content,
        correct,
        feedback: feedback || ""
      })),
      answers: answers.map(
        ({
          id_answer,
          id_option,
          answer_seconds,
          audio_url,
          text,
          gradeAnswers,
          team
        }) => ({
          id: id_answer,
          idOption: id_option || null,
          answerSeconds: answer_seconds || null,
          audioUrl: audio_url || null,
          text: text || null,
          gradeAnswers: gradeAnswers.map(
            ({ id_grade_answer, grade, comment }) => ({
              id: id_grade_answer,
              grade,
              comment: comment || null
            })
          ),
          team: team
            ? {
                id: team.id_team,
                name: team.name
              }
            : null
        })
      )
    })
  );
}
