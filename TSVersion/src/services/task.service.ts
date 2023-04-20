import { TaskModel } from "@models";
import { Task } from "@interfaces/Task.types";
import { ApiError } from "@middlewares/handleErrors";

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
