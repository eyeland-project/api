import { Request, Response, NextFunction } from "express";
import { getTaskById, getTasks as getTasksServ } from "@services/task.service";
import { TaskDetailDto, TaskSummaryDto } from "@dto/teacher/task.dto";

export async function getTasks(
  req: Request,
  res: Response<TaskSummaryDto[]>,
  next: NextFunction
) {
  try {
    const tasks = await getTasksServ();
    res.status(200).json(
      tasks.map(
        ({ id_task, name, description, task_order, thumbnail_url }) => ({
          id: id_task,
          name,
          description,
          thumbnailUrl: thumbnail_url || "",
          taskOrder: task_order
        })
      )
    );
  } catch (err) {
    next(err);
  }
}

export async function getTask(
  req: Request<{ idTask: number }>,
  res: Response<TaskDetailDto>,
  next: NextFunction
) {
  const { idTask } = req.params;
  try {
    const task = await getTaskById(idTask);
    const {
      id_task,
      name,
      description,
      long_description,
      keywords,
      task_order,
      thumbnail_url
    } = task;
    // res.status(200).json({
    //   id: id_task,
    //   name,
    //   description,
    //   longDescription: long_description || "",
    //   keywords,
    //   taskOrder: task_order,
    //   thumbnailUrl: thumbnail_url || ""
    // });
  } catch (err) {
    next(err);
  }
}
