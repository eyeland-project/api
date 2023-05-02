import { FindOptions, Op, QueryTypes } from "sequelize";
import sequelize from "@database/db";
import {
  AnswerModel,
  OptionModel,
  QuestionModel,
  TaskModel,
  TaskStageModel
} from "@models";
import { Question } from "@interfaces/Question.types";
import { ApiError } from "@middlewares/handleErrors";
import { QuestionDetailDto } from "@dto/global/question.dto";
import {
  QuestionPretaskDetailDto as QuestionPretaskDetailDtoStudent,
  QuestionDuringtaskDetailDto as QuestionDuringtaskDetailDtoStudent,
  QuestionPostaskDetailDto as QuestionPostaskDetailDtoStudent
} from "@dto/student/question.dto";
import {
  QuestionPretaskDetailDto as QuestionPretaskDetailDtoTeacher,
  QuestionDuringtaskDetailDto as QuestionDuringtaskDetailDtoTeacher,
  QuestionPostaskDetailDto as QuestionPostaskDetailDtoTeacher
} from "@dto/teacher/question.dto";
import * as repositoryService from "@services/repository.service";
import {
  distributeOptions,
  indexPower,
  separateTranslations,
  shuffle
} from "@utils";
import { getCurrTaskAttempt } from "@services/taskAttempt.service";
import { getTeammates } from "@services/student.service";
import { getMembersFromTeam } from "./team.service";

export async function getQuestionsFromPretaskForTeacher(
  idTask: number
): Promise<QuestionPretaskDetailDtoTeacher[]> {
  return (await getQuestionsFromTaskStage({ idTask }, 1)).map(
    ({ audioUrl, videoUrl, ...fields }) => fields
  );
}

export async function getQuestionsFromDuringtaskForTeacher(
  idTask: number
): Promise<QuestionDuringtaskDetailDtoTeacher[]> {
  return (await getQuestionsFromTaskStage({ idTask }, 2)).map(
    ({ content, ...fields }) => {
      const {
        nouns,
        preps,
        content: contentParsed
      } = separateTranslations(content);
      return {
        ...fields,
        content: contentParsed,
        nounTranslation: nouns,
        prepositionTranslation: preps
      };
    }
  );
}

export async function getQuestionsFromPostaskForTeacher(
  idTask: number
): Promise<QuestionPostaskDetailDtoTeacher[]> {
  return await getQuestionsFromTaskStage({ idTask }, 3);
}

export async function getQuestionsFromPretaskForStudent(
  taskOrder: number
): Promise<QuestionPretaskDetailDtoStudent[]> {
  const questions = (
    await getQuestionsFromTaskStage(
      { taskOrder },
      1,
      {},
      { limit: 10, order: sequelize.random() }
    )
  ).map(({ audioUrl, videoUrl, ...fields }) => fields);
  questions.sort((a, b) => {
    // move nulls to the end
    if (!a.topic) return 1;
    if (!b.topic) return -1;
    return a.topic.localeCompare(b.topic);
  });
  return questions;
}

export async function getQuestionFromPretaskForStudent(
  taskOrder: number,
  questionOrder: number
): Promise<QuestionPretaskDetailDtoStudent> {
  const questions = (
    await getQuestionsFromTaskStage(
      { taskOrder },
      1,
      { question_order: questionOrder },
      { limit: 1 }
    )
  ).map(({ audioUrl, videoUrl, ...fields }) => fields);
  if (!questions.length) throw new ApiError("Question not found", 404);
  return questions[0];
}

export async function getQuestionFromDuringtaskForStudent(
  idStudent: number,
  taskOrder: number,
  questionOrder: number
): Promise<QuestionDuringtaskDetailDtoStudent> {
  const { id_team, power } = await getCurrTaskAttempt(idStudent);
  if (!id_team || !power) {
    throw new ApiError("No team or power found", 400);
  }
  const powers = (await getTeammates(idStudent, { idTeam: id_team })).map(
    ({ task_attempt }) => task_attempt.power
  );
  powers.push(power);
  powers.sort((a, b) => indexPower(a) - indexPower(b));

  const questions = (
    await getQuestionsFromTaskStage(
      { taskOrder },
      2,
      { question_order: questionOrder },
      { limit: 1 }
    )
  ).map(({ content, options, id, ...fields }) => {
    const {
      nouns,
      preps,
      content: contentParsed
    } = separateTranslations(content);

    // * shuffle options
    options = shuffle(options, (id_team + 1) * (id + 2));
    // * distribute options based on power
    options = distributeOptions(
      options,
      powers.indexOf(power) + 1,
      powers.length
    );
    return {
      id,
      content: contentParsed,
      ...fields,
      nounTranslation: nouns,
      prepositionTranslation: preps,
      options
    };
  });
  if (!questions.length) throw new ApiError("Question not found", 404);
  return questions[0];
}

export async function getNextQuestionFromDuringtaskForStudent(
  idStudent: number,
  taskOrder: number
): Promise<QuestionDuringtaskDetailDtoStudent> {
  const { id_team, power } = await getCurrTaskAttempt(idStudent);

  // * Validations
  if (!id_team || !power) {
    throw new ApiError("No team or power found", 400);
  }
  const members = await getMembersFromTeam({ idTeam: id_team });

  // * Get all questios that have been not answered or answered incorrectly
  const missingQuestions = (
    await repositoryService.findAll<QuestionModel>(QuestionModel, {
      include: [
        {
          model: AnswerModel,
          as: "answers",
          where: {
            id_team
          },
          required: false,
          include: [
            {
              model: OptionModel,
              as: "option",
              required: true
            }
          ]
        },
        {
          model: TaskStageModel,
          as: "taskStage",
          where: {
            task_order: taskOrder,
            attributes: [],
            task_stage_order: 2
          },
          required: true
        }
      ]
    })
  ).filter(({ answers }) => {
    return answers.every(({ option }) => !option.correct);
  });

  console.log(missingQuestions.map(({ content: id }) => id));

  // * Sort from the less answered to the most answered and from the lowest order to the highest order
  missingQuestions.sort((a, b) => {
    const aAnswers = a.answers.length;
    const bAnswers = b.answers.length;
    if (aAnswers !== bAnswers) {
      return aAnswers - bAnswers;
    }
    return a.question_order - b.question_order;
  });

  const nextQuestion =
    missingQuestions.length === 0 || //* If all questions have been answered
    (missingQuestions.length === 1 && missingQuestions[0].answers?.length > 0) //* or there is only one question and it has been answered before (it is a retry)
      ? []
      : [missingQuestions[0]];

  const nextQuestionOrder = nextQuestion[0]?.question_order ?? -1;

  // const highestAnswer = (
  //   await repositoryService.findAll<AnswerModel>(AnswerModel, {
  //     where: {
  //       [Op.or]: members.map(({ task_attempt: { id } }) => ({
  //         id_task_attempt: id
  //       }))
  //     },
  //     include: {
  //       model: QuestionModel,
  //       attributes: ["question_order"],
  //       as: "question",
  //       include: [
  //         {
  //           model: TaskStageModel,
  //           attributes: [],
  //           as: "taskStage",
  //           where: {
  //             task_stage_order: 2
  //           }
  //         }
  //       ]
  //     },
  //     order: [["question", "question_order", "DESC"]],
  //     limit: 1
  //   })
  // )[0];
  // const nextQuestionOrder = highestAnswer?.question.question_order + 1 || 1;
  const powers = members.map(({ task_attempt: { power } }) => power);
  powers.sort((a, b) => indexPower(a) - indexPower(b));

  const questions = (
    await getQuestionsFromTaskStage(
      { taskOrder },
      2,
      { question_order: nextQuestionOrder },
      { limit: 1 }
    )
  ).map(({ content, options, id, ...fields }) => {
    const {
      nouns,
      preps,
      content: contentParsed
    } = separateTranslations(content);

    // * shuffle options
    options = shuffle(options, (id_team + 1) * (id + 2));
    // * distribute options based on power
    options = distributeOptions(
      options,
      powers.indexOf(power) + 1,
      powers.length
    );
    return {
      id,
      content: contentParsed,
      ...fields,
      nounTranslation: nouns,
      prepositionTranslation: preps,
      options
    };
  });
  if (!questions.length) throw new ApiError("Question not found", 404);
  return questions[0];
}

export async function getQuestionFromPostaskForStudent(
  taskOrder: number,
  questionOrder: number
): Promise<QuestionPostaskDetailDtoStudent> {
  const questions = await getQuestionsFromTaskStage(
    { taskOrder },
    3,
    { question_order: questionOrder },
    { limit: 1 }
  );
  if (!questions.length) throw new ApiError("Question not found", 404);
  return questions[0];
}

export async function getQuestionByOrder(
  taskOrder: number,
  taskStageOrder: number,
  questionOrder: number
): Promise<Question> {
  const questions = (await sequelize.query(
    `
        SELECT q.* FROM question q
        JOIN task_stage ts ON q.id_task_stage = ts.id_task_stage
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder} AND q.question_order = ${questionOrder}
        LIMIT 1;
    `,
    { type: QueryTypes.SELECT }
  )) as Question[];
  if (!questions.length) throw new ApiError("Question not found", 404);
  return questions[0];
}

export async function getQuestionsFromTaskStageByTaskId(
  idTask: number,
  TaskStageOrder: number
): Promise<Question[]> {
  const questions = await sequelize.query<Question>(
    `
        SELECT q.* FROM question q
        JOIN task_stage ts ON q.id_task_stage = ts.id_task_stage AND ts.task_stage_order = ${TaskStageOrder}
        JOIN task t ON ts.id_task = t.id_task AND t.id_task = ${idTask}
    `,
    { type: QueryTypes.SELECT }
  );
  return questions;
}

async function getQuestionsFromTaskStage(
  { idTask, taskOrder }: { idTask?: number; taskOrder?: number },
  taskStageOrder: number,
  where?: Partial<Question>,
  options?: FindOptions
): Promise<QuestionDetailDto[]> {
  if (idTask === undefined && taskOrder === undefined)
    throw new ApiError("idTask or taskOrder is required", 400);
  const questions = await repositoryService.findAll<QuestionModel>(
    QuestionModel,
    {
      where,
      include: [
        {
          model: TaskStageModel,
          as: "taskStage",
          attributes: [],
          where: {
            task_stage_order: taskStageOrder
          },
          include: [
            {
              model: TaskModel,
              as: "task",
              attributes: [],
              where: {
                ...(idTask !== undefined
                  ? {
                      id_task: idTask
                    }
                  : {
                      task_order: taskOrder
                    })
              }
            }
          ]
        },
        {
          model: OptionModel,
          as: "options",
          required: false
        }
      ],
      ...options
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
      options
    }) => ({
      id: id_question,
      questionOrder: question_order,
      content,
      type,
      topic,
      imgAlt: img_alt || null,
      imgUrl: img_url || null,
      audioUrl: audio_url || null,
      videoUrl: video_url || null,
      options: options.map(({ id_option, content, correct, feedback }) => ({
        id: id_option,
        content,
        correct,
        feedback: feedback || ""
      }))
    })
  );
}
