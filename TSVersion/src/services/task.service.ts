import { QueryTypes } from "sequelize";
import sequelize from "../database";
import TaskModel from "../models/Task";
import { TaskResp } from "../types/respSchemas/student/Task.types";
// import { getLinks } from './pretask.service'
// import { getQuestions } from './inTask.service'

export async function getTaskCount(): Promise<number> {
    return await TaskModel.count();
}

// export async function getTasksOrdered (): Promise<TaskModel[]> {
//     return await TaskModel.findAll({ order: [['task_order', 'ASC']] });
// }

export async function getStudentTasksOrdered (idStudent: number): Promise<TaskResp[]> {
    return await sequelize.query(`
        SELECT task.id_task as id, task.name, task.description, task.task_order as "taskOrder", task.thumbnail_url as "thumbnailUrl", student_task.completed FROM task
        LEFT JOIN student_task ON task.id_task = student_task.id_task
        WHERE student_task.id_student = ${idStudent}
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