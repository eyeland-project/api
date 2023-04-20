import { Request, Response, NextFunction } from "express";
import { getTaskByOrder } from "@services/task.service";
import {
  TaskSummaryDto,
  TaskDetailDto,
  TaskProgressDetailDto
} from "@dto/student/task.dto";
import {
  getStudentProgressFromTaskByOrder,
  getTasksFromStudentWithCompleted
} from "@services/studentTask.service";
import { finishStudentTaskAttempts } from "@services/taskAttempt.service";

// interface UserWithId{
//     id: number;
// }

// declare global {
//     namespace Express {
//         interface User extends UserWithId {}
//     }
// }

export async function root(
  req: Request,
  res: Response<TaskSummaryDto[]>,
  next: NextFunction
) {
  try {
    const { id: idStudent } = req.user!;
    res.status(200).json(await getTasksFromStudentWithCompleted(idStudent));
  } catch (err) {
    next(err);
  }
}

export async function getIntro(
  req: Request<{ taskOrder: number }>,
  res: Response<TaskDetailDto>,
  next: NextFunction
) {
  try {
    const { id: idStudent } = req.user!;
    const { taskOrder } = req.params;

    try {
      await finishStudentTaskAttempts(idStudent); // Finish all previous task attempts (await may not be necessary)
    } catch (err) {
      console.error(err);
    }

    const task = await getTaskByOrder(taskOrder);
    res.status(200).json({
      id: task.id_task,
      name: task.name,
      description: task.description,
      taskOrder: task.task_order,
      thumbnailUrl: task.thumbnail_url || "",
      thumbnailAlt: task.thumbnail_alt || "",
      keywords: task.keywords,
      longDescription: task.long_description || ""
    });
  } catch (err) {
    next(err);
  }
}

export async function getProgress(
  req: Request<{ taskOrder: number }>,
  res: Response<TaskProgressDetailDto>,
  next: NextFunction
) {
  try {
    const { id: idStudent } = req.user!;
    const { taskOrder } = req.params;
    res
      .status(200)
      .json(await getStudentProgressFromTaskByOrder(taskOrder, idStudent));
  } catch (err) {
    next(err);
  }
}

export async function finishAttempt(
  req: Request<{ taskOrder: number }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: idStudent } = req.user!;
    await finishStudentTaskAttempts(idStudent);
    res.status(200).json({ message: "OK" });
  } catch (err) {
    next(err);
  }
}
