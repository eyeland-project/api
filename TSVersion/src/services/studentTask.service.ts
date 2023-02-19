import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskProgressResp } from "../types/responses/students.types";
import { StudentTask } from "../types/database/StudentTask.types";

export async function getStudentTaskProgressByOrder(taskOrder: number, idStudent: number): Promise<TaskProgressResp[]> {
    const studentTasks = await sequelize.query(`
        SELECT st.*
        FROM student_task st
        JOIN task t ON t.id_task = st.id_task
        WHERE st.id_student = ${idStudent} AND t.task_order = ${taskOrder}
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as StudentTask[];

    const highestStage = studentTasks.length ? studentTasks[0].highest_stage : 0;
    return Array.from({ length: 3 }, (_, i) => ({
        blocked: i > highestStage,
        completed: i < highestStage
    }));
}
