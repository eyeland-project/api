import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskModel } from "../models";
import { TaskResp as TaskRespStudent } from "../types/responses/students.types";
import { Task } from "../types/Task.types";
import { ApiError } from "../middlewares/handleErrors";

export async function getTaskCount(): Promise<number> {
  return await TaskModel.count();
}

export async function getTaskByOrder(taskOrder: number): Promise<Task> {
  const task = await TaskModel.findOne({ where: { task_order: taskOrder } });
  if (!task) throw new ApiError("Task not found", 404);
  return task;
}

export async function getTasks(): Promise<Task[]> {
  return await TaskModel.findAll({ order: [["task_order", "ASC"]] });
}

export async function getTaskById(idTask: number): Promise<Task> {
  const task = await TaskModel.findOne({ where: { id_task: idTask } });
  if (!task) throw new ApiError("Task not found", 404);
  return task;
}

// export async function getAllLinksByOrder(taskOrder: number): Promise<any> {
//     // throw new Error("Method not implemented.");
//     const task = (await Task.findOne({where: {orden: taskOrder}}));

//     if(!task){
//         return null;
//     }
//     return getLinks({id_task: task.id_task});
// }

// //! Refactorize this function
// export async function getTaskQuestionsByOrder(taskOrder: number): Promise<any> {
//     // throw new Error("Method not implemented.");
//     const task = (await Task.findOne({where: {orden: taskOrder}}));

//     if(!task){
//         return null;
//     }
//     return (await getQuestions({id_task: task.id_task}));
// }
