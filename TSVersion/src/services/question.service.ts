import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { QuestionModel } from "../models";
import { Question } from "../types/Question.types";
import { ApiError } from "../middlewares/handleErrors";
import { Answer } from "../types/Answer.types";

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

export async function getTaskStageQuestionsCount(
  idTaskStage: number
): Promise<number> {
  return await QuestionModel.count({ where: { id_task_stage: idTaskStage } });
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
