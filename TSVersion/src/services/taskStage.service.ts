import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskModel, TaskStageModel } from "../models";
import { TaskStage } from "../types/TaskStage.types";
import { ApiError } from "../middlewares/handleErrors";

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

export async function duringtaskAvailable(idStudent: number): Promise<boolean> {
    const results = await sequelize.query(`
        SELECT c.session, t.active FROM student s
        LEFT JOIN task_attempt ta ON s.id_student = ta.id_student
        LEFT JOIN team t ON ta.id_team = t.id_team
        LEFT JOIN course c ON c.id_course = s.id_course
        WHERE s.id_student = ${idStudent} AND ta.active = TRUE AND c.session = TRUE AND t.active = TRUE
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as { session: boolean, active: boolean }[];
    return results.length != 0;
}

export async function postaskAvailable(idStudent: number): Promise<boolean> {
    const results = await sequelize.query(`
        SELECT c.session FROM student s
        LEFT JOIN task_attempt ta ON s.id_student = ta.id_student
        LEFT JOIN course c ON c.id_course = s.id_course
        WHERE s.id_student = ${idStudent} AND ta.active = TRUE AND c.session = TRUE
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as { session: boolean, active: boolean }[];
    return results.length != 0;
}
