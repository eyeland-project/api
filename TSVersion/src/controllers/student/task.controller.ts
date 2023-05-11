import { Request, Response, NextFunction } from "express";
import { getTaskForStudent, getTasksForStudent } from "@services/task.service";
import {
  TaskSummaryDto,
  TaskDetailDto,
  TaskProgressDetailDto
} from "@dto/student/task.dto";
import { getStudentProgressFromTask } from "@services/studentTask.service";
import { ApiError } from "@middlewares/handleErrors";

export async function getTasks(
  req: Request,
  res: Response<TaskSummaryDto[]>,
  next: NextFunction
) {
  try {
    const { id: idStudent } = req.user!;
    res.status(200).json(await getTasksForStudent(idStudent));
  } catch (err) {
    next(err);
  }
}

export async function getTask(
  req: Request<{ taskOrder: string }>,
  res: Response<TaskDetailDto>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid task order", 400);
    }
    res.status(200).json(await getTaskForStudent(taskOrder));
  } catch (err) {
    next(err);
  }
}

export async function getProgress(
  req: Request<{ taskOrder: string }>,
  res: Response<TaskProgressDetailDto>,
  next: NextFunction
) {
  const { id: idStudent } = req.user!;
  const taskOrder = parseInt(req.params.taskOrder);
  try {
    if (isNaN(taskOrder) || taskOrder <= 0) {
      throw new ApiError("Invalid task order", 400);
    }
    res
      .status(200)
      .json(await getStudentProgressFromTask(taskOrder, idStudent));
  } catch (err) {
    next(err);
  }
}
