import { TaskModel, TaskStageModel } from "@models";
import { Task } from "@interfaces/Task.types";
import { ApiError } from "@middlewares/handleErrors";
import * as repositoryService from "@services/repository.service";
import {
  TaskDetailDto as TaskDetailDtoTeacher,
  TaskSummaryDto as TaskSummaryDtoTeacher
} from "@dto/teacher/task.dto";
import {
  TaskDetailDto as TaskDetailDtoStudent,
  TaskSummaryDto as TaskSummaryDtoStudent
} from "@dto/student/task.dto";
import sequelize from "@database/db";
import { QueryTypes } from "sequelize";
import { finishStudentTaskAttempts } from "@services/taskAttempt.service";

export async function getTasksForStudent(
  idStudent: number
): Promise<TaskSummaryDtoStudent[]> {
  interface TaskWithHighestStage extends Task {
    highest_stage: number;
  }
  const tasks = (await sequelize.query(
    `
      SELECT t.*, st.highest_stage
      FROM task t
      LEFT JOIN student_task st ON t.id_task = st.id_task
      WHERE st.id_student = ${idStudent}
      ORDER BY task_order ASC;
  `,
    { type: QueryTypes.SELECT }
  )) as TaskWithHighestStage[];

  return tasks.map(
    (
      {
        id_task,
        name,
        description,
        task_order,
        highest_stage,
        thumbnail_url,
        coming_soon,
        thumbnail_alt
      },
      index
    ) =>
      ({
        id: id_task,
        name,
        description,
        taskOrder: task_order,
        completed: highest_stage === 3, // 3 is the highest stage
        blocked: task_order === 1 ? false : tasks[index - 1].highest_stage < 3,
        thumbnailUrl: thumbnail_url,
        thumbnailAlt: thumbnail_alt,
        comingSoon: coming_soon
      } as TaskSummaryDtoStudent)
  );
}

export async function getTaskForStudent(
  idStudent: number,
  taskOrder: number
): Promise<TaskDetailDtoStudent> {
  try {
    await finishStudentTaskAttempts(idStudent); // Finish all previous task attempts (await may not be necessary)
  } catch (err) {
    console.error(err);
  }

  const {
    id_task,
    name,
    description,
    thumbnail_url,
    thumbnail_alt,
    keywords,
    long_description
  } = await repositoryService.findOne<TaskModel>(TaskModel, {
    where: { task_order: taskOrder }
  });
  return {
    id: id_task,
    name,
    description,
    taskOrder,
    thumbnailUrl: thumbnail_url || "",
    thumbnailAlt: thumbnail_alt || "",
    keywords,
    longDescription: long_description || ""
  };
}

export async function getTasksForTeacher(): Promise<TaskSummaryDtoTeacher[]> {
  return (
    await repositoryService.findAll<TaskModel>(TaskModel, {
      order: [["task_order", "ASC"]]
    })
  ).map(({ id_task, name, task_order }) => ({
    id: id_task,
    name,
    taskOrder: task_order
  }));
}

export async function getTaskForTeacher(
  idTask: number
): Promise<TaskDetailDtoTeacher> {
  const {
    id_task,
    name,
    description,
    task_order,
    thumbnail_url,
    long_description,
    keywords
  } = await repositoryService.findOne<TaskModel>(TaskModel, {
    where: { id_task: idTask }
  });
  return {
    id: id_task,
    name,
    description,
    taskOrder: task_order,
    thumbnailUrl: thumbnail_url || "",
    longDescription: long_description || "",
    keywords
  };
}
