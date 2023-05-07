import { QueryTypes } from "sequelize";
import sequelize from "@database/db";
import { OptionModel, QuestionModel, TaskModel, TaskStageModel } from "@models";
import { ApiError } from "@middlewares/handleErrors";
import { Question } from "@interfaces/Question.types";
import { QuestionDetailDto } from "@dto/global/question.dto";
import { TaskStageDetailDto as TaskStageDetailDtoTeacher } from "@dto/teacher/taskStage.dto";
import { TaskStageDetailDto as TaskStageDetailDtoStudent } from "@dto/student/taskStage.dto";
import * as repositoryService from "@services/repository.service";

export async function getPretaskForTeacher(
  idTask: number
): Promise<TaskStageDetailDtoTeacher> {
  return await getTaskStageForTeacher(idTask, 1);
}

export async function getDuringtaskForTeacher(
  idTask: number
): Promise<TaskStageDetailDtoTeacher> {
  return await getTaskStageForTeacher(idTask, 2);
}

export async function getPostaskForTeacher(
  idTask: number
): Promise<TaskStageDetailDtoTeacher> {
  return await getTaskStageForTeacher(idTask, 3);
}

export async function getPretaskForStudent(
  taskOrder: number
): Promise<TaskStageDetailDtoStudent> {
  return await getTaskStageForStudent(taskOrder, 1);
}

export async function getDuringtaskForStudent(
  taskOrder: number
): Promise<TaskStageDetailDtoStudent> {
  return await getTaskStageForStudent(taskOrder, 2);
}

export async function getPostaskForStudent(
  taskOrder: number
): Promise<TaskStageDetailDtoStudent> {
  return await getTaskStageForStudent(taskOrder, 3);
}

export async function getLastQuestionFromTaskStage(
  taskOrder: number,
  taskStageOrder: number
): Promise<Question> {
  const questions = (await sequelize.query(
    `
        SELECT q.* FROM question q
        JOIN task_stage ts ON q.id_task_stage = ts.id_task_stage
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder}
        ORDER BY q.question_order DESC
        LIMIT 1;
    `,
    { type: QueryTypes.SELECT }
  )) as Question[];
  if (!questions.length) throw new ApiError("Question not found", 404);
  return questions[0];
}

export async function getQuestionsFromTaskStage(
  taskOrder: number,
  taskStageOrder: number
): Promise<QuestionDetailDto[]> {
  const questions = await QuestionModel.findAll({
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
              task_order: taskOrder
            }
          }
        ]
      },
      {
        model: OptionModel,
        as: "options"
      }
    ],
    limit: taskStageOrder === 1 ? 10 : undefined,
    order: taskStageOrder === 1 ? sequelize.random() : undefined
  });

  return questions.map(
    ({
      content,
      id_question,
      question_order,
      img_alt,
      img_url,
      topic,
      type,
      options,
      audio_url,
      video_url,
      hint,
      character
    }) => ({
      id: id_question,
      questionOrder: question_order,
      content,
      topic: topic || null,
      type,
      imgAlt: img_alt || null,
      imgUrl: img_url || null,
      audioUrl: audio_url || null,
      videoUrl: video_url || null,
      hint: hint || null,
      character: character || null,
      options: options.map((option) => {
        const { content, correct, feedback, id_option } = option;
        return {
          id: id_option,
          content,
          feedback: feedback!,
          correct
        };
      })
    })
  );
}

async function getTaskStageForTeacher(
  idTask: number,
  taskStageOrder: number
): Promise<TaskStageDetailDtoTeacher> {
  const { description, keywords, id_task_stage, task_stage_order, questions } =
    await getTaskStage({ idTask }, taskStageOrder);
  return {
    id: id_task_stage,
    taskStageOrder: task_stage_order,
    description,
    keywords,
    numQuestions: questions.length
  };
}

async function getTaskStageForStudent(
  taskOrder: number,
  taskStageOrder: number
): Promise<TaskStageDetailDtoStudent> {
  const { description, keywords, questions } = await getTaskStage(
    { taskOrder },
    taskStageOrder
  );
  return {
    description,
    keywords,
    numQuestions: questions.length
  };
}

async function getTaskStage(
  { idTask, taskOrder }: { idTask?: number; taskOrder?: number },
  taskStageOrder: number
): Promise<TaskStageModel> {
  if (idTask === undefined && taskOrder === undefined)
    throw new ApiError("idTask or taskOrder is required", 400);
  return await repositoryService.findOne<TaskStageModel>(TaskStageModel, {
    where: {
      task_stage_order: taskStageOrder
    },
    include: [
      {
        model: QuestionModel,
        as: "questions",
        attributes: ["id_question"],
        required: false
      },
      {
        model: TaskModel,
        as: "task",
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
  });
}
