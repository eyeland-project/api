import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskProgressResp as TaskProgressRespStud } from "../types/responses/students.types";
import { StudentTask } from "../types/StudentTask.types";
import { TaskModel } from "../models";

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

export async function canStudentAnswerPretask(
  taskOrder: number,
  idStudent: number
): Promise<boolean> {
  if (+taskOrder === 1) return true;

  const results = await sequelize.query(
    `
        SELECT s.id_student FROM student s
        LEFT JOIN task_attempt ta ON s.id_student = ta.id_student
        LEFT JOIN task t
        LEFT JOIN student_task st ON s.id_student = st.id_student
        WHERE s.id_student = ${idStudent} AND t.task_order = ${
      taskOrder - 1
    } AND st.highest_stage >= 3 AND ta.active
        --LIMIT 1;
    `,
    { type: QueryTypes.SELECT }
  );
  console.log("results", results);

  return results.length !== 0;
}

export async function canStudentAnswerDuringtask(
  taskOrder: number,
  idStudent: number
): Promise<boolean> {
  const results = await sequelize.query(
    `
        SELECT s.id_student FROM student s
        LEFT JOIN task_attempt ta ON s.id_student = ta.id_student
        LEFT JOIN team t ON ta.id_team = t.id_team
        LEFT JOIN course c ON c.id_course = s.id_course
        LEFT JOIN student_task st ON s.id_student = st.id_student AND ta.id_task = st.id_task 
        WHERE s.id_student = ${idStudent} AND ta.active AND c.session AND t.active AND st.highest_stage >= 1
        --LIMIT 1;
    `,
    { type: QueryTypes.SELECT }
  );
  console.log("results", results);

  return results.length !== 0;
}

export async function canStudentAnswerPostask(
  taskOrder: number,
  idStudent: number
): Promise<boolean> {
  const results = await sequelize.query(
    `
        SELECT s.id_student FROM student s
        LEFT JOIN task_attempt ta ON s.id_student = ta.id_student
        LEFT JOIN course c ON c.id_course = s.id_course
        LEFT JOIN student_task st ON s.id_student = st.id_student AND ta.id_task = st.id_task 
        WHERE s.id_student = ${idStudent} AND ta.active AND c.session AND st.highest_stage >= 2
        --LIMIT 1;
    `,
    { type: QueryTypes.SELECT }
  );
  console.log("results", results);

  return results.length !== 0;
}
