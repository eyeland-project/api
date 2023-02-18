import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskModel, TaskStageModel } from "../models";
import { TaskStage } from "../types/database/TaskStage.types";
import { ApiError } from "../middlewares/handleErrors";

export async function getTaskStageByOrder(taskOrder: number, taskStageOrder: number): Promise<TaskStage> {
    // const taskStage = await TaskStageModel.findOne({
    //     include: [{
    //       model: TaskModel,
    //       where: { task_order: taskOrder },
    //     }],
    //     where: { task_stage_order: taskStageOrder },
    //   });
    // if (!taskStage) throw new Error('TaskStage not found');
    // return taskStage;
    const taskStages = await sequelize.query(`
        SELECT ts.* FROM task_stage ts
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder}
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as TaskStage[];
    if (!taskStages.length) throw new ApiError('TaskStage not found', 404);
    return taskStages[0];
}
