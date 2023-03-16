import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { QuestionModel, TaskModel, TaskStageModel } from "../models";
import { TaskStage } from "../types/TaskStage.types";
import { ApiError } from "../middlewares/handleErrors";
import { Question } from "../types/Question.types";

export async function getTaskStageByOrder(taskOrder: number, taskStageOrder: number): Promise<TaskStage> {
    const taskStages = await sequelize.query(`
        SELECT ts.* FROM task_stage ts
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder}
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as TaskStage[];
    if (!taskStages.length) throw new ApiError('TaskStage not found', 404);
    return taskStages[0];
}

export async function getLastQuestionFromTaskStage(taskOrder: number, taskStageOrder: number): Promise<Question> {
    const questions = await sequelize.query(`
        SELECT q.* FROM question q
        JOIN task_stage ts ON q.id_task_stage = ts.id_task_stage
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder}
        ORDER BY q.question_order DESC
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as Question[];
    if (!questions.length) throw new ApiError('Question not found', 404);
    return questions[0];
}
