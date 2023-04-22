import { Request, Response, NextFunction } from "express";
import { TaskDetailDto, TaskSummaryDto } from "@dto/teacher/task.dto";
import { getTaskForTeacher, getTasksForTeacher } from "@services/task.service";
import { ApiError } from "@middlewares/handleErrors";

export async function getTasks(
  _: Request,
  res: Response<TaskSummaryDto[]>,
  next: NextFunction
) {
  try {
    res.status(200).json(await getTasksForTeacher());
  } catch (err) {
    next(err);
  }
}

export async function getTask(
  req: Request<{ idTask: string }>,
  res: Response<TaskDetailDto>,
  next: NextFunction
) {
  const idTask = parseInt(req.params.idTask);
  try {
    if (isNaN(idTask) || idTask <= 0) {
      throw new ApiError("Invalid task id", 400);
    }
    res.status(200).json(await getTaskForTeacher(idTask));
  } catch (err) {
    next(err);
  }
}
