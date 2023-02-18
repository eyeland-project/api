import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskModel } from '../models'
import { TaskResp } from "../types/responses/students.types";
import { Task } from "../types/database/Task.types";
import { ApiError } from "../middlewares/handleErrors";

export async function getTaskCount(): Promise<number> {
    return await TaskModel.count();
}

export async function getTaskByOrder(taskOrder: number): Promise<Task> {
    const task = await TaskModel.findOne({ where: { task_order: taskOrder } });
    if (!task) throw new ApiError('Task not found', 404);
    return task;
}

export async function getStudentTasks(idStudent: number): Promise<TaskResp[]> {
    return await sequelize.query(`
        SELECT t.*, st.completed
        FROM task t
        LEFT JOIN student_task st ON t.id_task = st.id_task
        WHERE st.id_student = ${idStudent}
        ORDER BY task_order ASC;
    `, { type: QueryTypes.SELECT });
}

// export async function getAllLinksByOrder(taskOrder: number): Promise<any> {
//     // throw new Error("Method not implemented.");
//     const task = (await Task.findOne({where: {orden: taskOrder}}));

//     if(!task){
//         return null;
//     }
//     return getLinks({id_task: task.id_task});
// }

// //! Refactorize this function
// export async function getTaskQuestionsByOrder(taskOrder: number): Promise<any> {
//     // throw new Error("Method not implemented.");
//     const task = (await Task.findOne({where: {orden: taskOrder}}));
    
//     if(!task){
//         return null;
//     }
//     return (await getQuestions({id_task: task.id_task}));
// }