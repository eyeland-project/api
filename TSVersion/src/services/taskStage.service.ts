import { FindOptions, QueryTypes } from "sequelize";
import sequelize from "@database/db";
import { OptionModel, QuestionModel, TaskModel, TaskStageModel } from "@models";
import { ApiError } from "@middlewares/handleErrors";
import { Question } from "@interfaces/Question.types";
import { QuestionDetailDto } from "@dto/global/question.dto";
import {
  TaskStageDetailDto as TaskStageDetailDtoTeacher,
  TaskStagesDetailDto as TaskStagesDetailDtoTeacher
} from "@dto/teacher/taskStage.dto";
import { TaskStageDetailDto as TaskStageDetailDtoStudent } from "@dto/student/taskStage.dto";
import * as repositoryService from "@services/repository.service";
import { TaskStage } from "@interfaces/TaskStage.types";

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

export async function getTaskStagesForTeacher(
  idTask: number
): Promise<TaskStagesDetailDtoTeacher> {
  const taskStages = await getTaskStages(
    { idTask },
    {},
    { order: [["task_stage_order", "ASC"]] }
  );
  const parseTaskAttempt = (index: number): TaskStageDetailDtoTeacher => {
    const {
      id_task_stage,
      keywords,
      task_stage_order,
      description,
      questions
    } = taskStages[index];
    return {
      id: id_task_stage,
      keywords,
      taskStageOrder: task_stage_order,
      description,
      numQuestions: questions.length
    };
  };
  return {
    pretask: parseTaskAttempt(0),
    duringtask: parseTaskAttempt(1),
    postask: parseTaskAttempt(2)
  };
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

async function getTaskStageForTeacher(
  idTask: number,
  taskStageOrder: number
): Promise<TaskStageDetailDtoTeacher> {
  const taskStage = (
    await getTaskStages(
      { idTask },
      { task_stage_order: taskStageOrder },
      { limit: 1 }
    )
  )[0];
  if (!taskStage) throw new ApiError("Task stage not found", 404);

  const { description, keywords, id_task_stage, task_stage_order, questions } =
    taskStage;
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
  const taskStage = (
    await getTaskStages(
      { taskOrder },
      { task_stage_order: taskStageOrder },
      { limit: 1 }
    )
  )[0];
  if (!taskStage) throw new ApiError("Task stage not found", 404);
  const { description, keywords, questions } = taskStage;
  return {
    description,
    keywords,
    numQuestions: questions.length
  };
}

async function getTaskStages(
  { idTask, taskOrder }: { idTask?: number; taskOrder?: number },
  where?: Partial<TaskStage>,
  options?: FindOptions
): Promise<TaskStageModel[]> {
  if (idTask === undefined && taskOrder === undefined) {
    throw new ApiError("idTask or taskOrder is required", 400);
  }

  return await repositoryService.findAll<TaskStageModel>(TaskStageModel, {
    where,
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
    ],
    ...options
  });
}
