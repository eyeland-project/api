import { QueryTypes } from "sequelize";
import sequelize from "@database/db";
import { TaskProgressDetailDto } from "@dto/student/task.dto";
import { StudentTask } from "@interfaces/StudentTask.types";
import { StudentTaskModel } from "@models";
import { ApiError } from "@middlewares/handleErrors";
import { Task } from "@interfaces/Task.types";

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

export async function getStudentProgressFromTask(
  taskOrder: number,
  idStudent: number
): Promise<TaskProgressDetailDto> {
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
  // console.log(studentTasks);
  const highestStage = studentTasks.length ? studentTasks[0].highest_stage : 0;
  return {
    pretask: {
      completed: highestStage >= 1,
      blocked: studentTasks.length === 2 && studentTasks[1].highest_stage < 3 // pretask is blocked if the student has not completed the postask of the previous task
    },
    duringtask: {
      completed: highestStage >= 2,
      blocked: highestStage < 1
    },
    postask: {
      completed: highestStage >= 3,
      blocked: highestStage < 2
    }
  };
}

export async function completePretask(taskOrder: number, idStudent: number) {
  return await upgradeStudentTaskProgress(taskOrder, idStudent, 1);
}

export async function completeDuringtask(taskOrder: number, idStudent: number) {
  return await upgradeStudentTaskProgress(taskOrder, idStudent, 2);
}

export async function completePostask(taskOrder: number, idStudent: number) {
  return await upgradeStudentTaskProgress(taskOrder, idStudent, 3);
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

export async function getStudentTasks(
  idStudent: number
): Promise<StudentTask[]> {
  return StudentTaskModel.findAll({ where: { id_student: idStudent } });
}

export async function getHighestTaskCompletedFromStudent(
  idStudent: number
): Promise<Task | null> {
  const tasks = await sequelize.query<Task>(
    `
    SELECT t.*
    FROM student_task st
    JOIN task t ON t.id_task = st.id_task
    WHERE st.id_student = ${idStudent} AND st.highest_stage = 3
    ORDER BY t.task_order DESC
    LIMIT 1;
  `,
    {
      type: QueryTypes.SELECT
    }
  );
  if (!tasks.length) return null;
  return tasks[0];
}
