import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskProgressResp as TaskProgressRespStud } from "../types/responses/students.types";
import { StudentTask } from "../types/StudentTask.types";
import { TaskModel } from "../models";

export async function getStudentTaskProgressByOrder(taskOrder: number, idStudent: number): Promise<TaskProgressRespStud> {
    const studentTasks = await sequelize.query<StudentTask>(`
        SELECT st.*
        FROM student_task st
        JOIN task t ON t.id_task = st.id_task
        WHERE st.id_student = ${idStudent} AND t.task_order = ${taskOrder}
        LIMIT 1;
    `, { type: QueryTypes.SELECT });

    const highestStage = studentTasks.length ? studentTasks[0].highest_stage : 0;
    return {
        pretask: {
            completed: highestStage >= 1,
            blocked: false
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

export async function updateStudentTaskProgress(taskOrder: number, idStudent: number, newHighestStage: number): Promise<void> {
    const result = await sequelize.query(`
            UPDATE student_task
            SET highest_stage = ${newHighestStage}
            WHERE id_student = ${idStudent} AND (SELECT id_task FROM task WHERE task_order = ${taskOrder}) = id_task;
        `, { type: QueryTypes.UPDATE });
    if (!result[0]) {
        const resultInsert = await sequelize.query(`
            INSERT INTO student_task (id_student, id_task, highest_stage)
            VALUES (${idStudent}, (SELECT id_task FROM task WHERE task_order = ${taskOrder}), ${newHighestStage});
        `, { type: QueryTypes.INSERT });
        if (!resultInsert[0]) throw new Error("Error inserting student_task");
    }
}
