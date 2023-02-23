import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TaskModel } from '../models'
import { TaskResp } from "../types/responses/students.types";
import { Task } from "../types/Task.types";
import { ApiError } from "../middlewares/handleErrors";

export async function getTaskCount(): Promise<number> {
    return await TaskModel.count();
}

export async function getTaskByOrder(taskOrder: number): Promise<Task> {
    const task = await TaskModel.findOne({ where: { task_order: taskOrder } });
    if (!task) throw new ApiError('Task not found', 404);
    return task;
}

export async function getTasksFromStudentWithCompleted(idStudent: number): Promise<TaskResp[]> {
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

    return tasks.map(({ id_task, name, description, task_order, highest_stage, thumbnail_url }) => ({
        id: id_task,
        name,
        description,
        taskOrder: task_order,
        completed: highest_stage === 3, // 3 is the highest stage
        thumbnailUrl: thumbnail_url
    } as TaskResp));
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