import { TaskStageModel } from "../models";
import { TaskStage } from "../types/database/TaskStage.types";

// export async function getTaskStageByOrder(taskOrder: number, taskStageOrder: number): Promise<TaskStage> {
//     const taskStage = await TaskStageModel.findOne({
//         where: { id_task: task.id_task, task_stage_order: taskStageOrder },
//     };
//     if (!taskStage) throw new Error('TaskStage not found');
//     return taskStage;
// }