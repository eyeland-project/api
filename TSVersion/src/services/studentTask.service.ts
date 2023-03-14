import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskProgressResp as TaskProgressRespStud } from "../types/responses/students.types";
import { StudentTask } from "../types/StudentTask.types";
import { TaskModel } from "../models";
import { ApiError } from "../middlewares/handleErrors";

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

export async function getStudentTaskProgressByOrder(
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
