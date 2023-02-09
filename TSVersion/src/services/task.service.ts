import Task from "../models/Task";
import { TaskModel } from "../types/Task.types";
// import { getLinks } from './pretask.service'
// import { getQuestions } from './inTask.service'

export async function getTaskCount(): Promise<number> {
    return await Task.count();
}

export async function getTasksOrdered (): Promise<TaskModel[]> {
    return await Task.findAll({ order: [['orden', 'ASC']] });
}

// export async function tas

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