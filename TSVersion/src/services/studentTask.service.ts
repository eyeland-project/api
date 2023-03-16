import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskProgressResp as TaskProgressRespStud } from "../types/responses/students.types";
import { StudentTask } from "../types/StudentTask.types";
import { StudentTaskModel, TaskModel } from "../models";
import { ApiError } from "../middlewares/handleErrors";
import { Task } from "../types/Task.types";
import { TaskResp as TaskRespStudent } from "../types/responses/students.types";

export async function getTasksFromStudentWithCompleted(idStudent: number): Promise<TaskRespStudent[]> {
  interface TaskWithHighestStage extends Task {
      highest_stage: number;
  }
  const tasks = await sequelize.query(`
      SELECT t.*, st.highest_stage
      FROM task t
      LEFT JOIN student_task st ON t.id_task = st.id_task
      WHERE st.id_student = ${idStudent}
      ORDER BY task_order ASC;
  `, { type: QueryTypes.SELECT }) as TaskWithHighestStage[];

  return tasks.map(({ id_task, name, description, task_order, highest_stage, thumbnail_url, coming_soon }, index) => ({
      id: id_task,
      name,
      description,
      taskOrder: task_order,
      completed: highest_stage === 3, // 3 is the highest stage
      blocked: task_order === 1 ? false : tasks[index - 1].highest_stage < 3,
      thumbnailUrl: thumbnail_url,
      comingSoon: coming_soon
  } as TaskRespStudent));
}

export async function getStudentTaskByOrder(
  idStudent: number,
  taskOrder: number
): Promise<StudentTask> {
  const studentTasks = await sequelize.query<StudentTask>(
    `
        SELECT st.* FROM student_task st
        JOIN task t ON t.id_task = st.id_task
        WHERE st.id_student = ${idStudent} AND t.task_order = ${taskOrder}
        LIMIT 1;
  `,
    { type: QueryTypes.SELECT }
  );
  if (!studentTasks.length) throw new ApiError("Student task not found", 404);
  return studentTasks[0];
}

export async function getStudentProgressFromTaskByOrder(
  taskOrder: number,
  idStudent: number
): Promise<TaskProgressRespStud> {
  const studentTasks = await sequelize.query<StudentTask>(
    `
        SELECT st.*
        FROM student_task st
        JOIN task t ON t.id_task = st.id_task
        WHERE st.id_student = ${idStudent} AND (t.task_order = ${taskOrder} OR t.task_order = ${
      taskOrder - 1
    })
        ORDER BY t.task_order DESC
        LIMIT 2;
    `,
    { type: QueryTypes.SELECT }
  );
  console.log(studentTasks);
  const highestStage = studentTasks.length ? studentTasks[0].highest_stage : 0;
  return {
    pretask: {
      completed: highestStage >= 1,
      blocked: studentTasks.length === 2 && studentTasks[1].highest_stage < 3, // pretask is blocked if the student has not completed the postask of the previous task
    },
    duringtask: {
      completed: highestStage >= 2,
      blocked: highestStage < 1,
    },
    postask: {
      completed: highestStage >= 3,
      blocked: highestStage < 2,
    },
  };
}

export async function upgradeStudentTaskProgress(
  taskOrder: number,
  idStudent: number,
  newHighestStage: number
): Promise<void> {
  await sequelize.query(
    `
        UPDATE student_task
        SET highest_stage = ${newHighestStage}
        WHERE id_student = ${idStudent} AND (SELECT id_task FROM task WHERE task_order = ${taskOrder}) = id_task AND highest_stage < ${newHighestStage}; -- Only upgrade if new highest stage is higher than the current one
    `,
    { type: QueryTypes.UPDATE }
  );
}

export async function getStudentTasks(idStudent: number): Promise<StudentTask[]> {
  return StudentTaskModel.findAll({ where: { id_student: idStudent } });
}

export async function getHighestTaskCompletedFromStudent(idStudent: number): Promise<Task | null> {
  const tasks = await sequelize.query<Task>(`
    SELECT t.*
    FROM student_task st
    JOIN task t ON t.id_task = st.id_task
    WHERE st.id_student = ${idStudent} AND st.highest_stage = 3
    ORDER BY t.task_order DESC
    LIMIT 1;
  `, {
    type: QueryTypes.SELECT,
  });
  if (!tasks.length) return null;
  return tasks[0];
}
