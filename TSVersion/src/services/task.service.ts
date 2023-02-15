import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { LinkModel, QuestionModel, TaskModel, TaskStageModel } from '../models'
import { DuringtaskResp, IntroductionResp, PostaskResp, PretaskResp, TaskResp } from "../types/responses/students.types";
import { Task } from "../types/database/Task.types";

export async function getTaskCount(): Promise<number> {
    return await TaskModel.count();
}

export async function getTaskByOrder(taskOrder: number): Promise<Task> {
    // const tasks = (await sequelize.query(`SELECT id_task as id, name, description, task_order as "taskOrder", thumbnail_url as "thumbnailUrl" FROM task WHERE task_order = ${taskOrder} LIMIT 1;`, { type: QueryTypes.SELECT })) as TaskResp[];
    // if (!tasks.length) throw new Error('Task not found');
    // return tasks[0];

    const task = await TaskModel.findOne({ where: { task_order: taskOrder } });
    if (!task) throw new Error('Task not found');
    return task;
}

export async function getStudentTasks(idStudent: number): Promise<TaskResp[]> {
    return await sequelize.query(`
        SELECT task.id_task as id, task.name, task.description, task.task_order as "taskOrder", task.thumbnail_url as "thumbnailUrl", student_task.completed FROM task
        LEFT JOIN student_task ON task.id_task = student_task.id_task
        WHERE student_task.id_student = ${idStudent}
        ORDER BY task_order ASC;
    `, { type: QueryTypes.SELECT });
}

export async function getTaskIntro(taskOrder: number): Promise<IntroductionResp> {
    const tasks = (await sequelize.query(`
        SELECT task.id_task as id, task.name, task.description, task.task_order as "taskOrder", task.thumbnail_url as "thumbnailUrl", task.keywords, task.long_description as "longDescription"
        FROM task
        WHERE task.task_order = ${taskOrder}
        LIMIT 1;
    `, { type: QueryTypes.SELECT })) as IntroductionResp[];
    if (!tasks.length) throw new Error('Task not found');
    return tasks[0];

    // const intro = await TaskModel.findOne({
    //     where: { task_order: taskOrder },
    //     attributes: [['id_task', 'id'], 'name', 'description', ['task_order', 'taskOrder'], ['thumbnail_url', 'thumbnailUrl'], 'keywords', ['long_description', 'longDescription']]
    // });
    // if (!intro) throw new Error('Task not found');
    // return {
    //     id: intro.id_task,
    //     name: intro.name,
    //     description: intro.description,
    //     taskOrder: intro.task_order,
    //     thumbnailUrl: intro.thumbnail_url,
    //     keywords: intro.keywords,
    //     longDescription: intro.long_description
    // };
}

export async function getPretask(taskOrder: number): Promise<PretaskResp> {
    const task = (await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    }));
    if (!task) throw new Error('Task not found');
    
    const pretask = await TaskStageModel.findOne({
        attributes: ['id_task_stage', 'description', 'keywords'],
        where: { id_task: task.id_task, task_stage_order: 1 }
    });
    if (!pretask) throw new Error('Pretask not found');

    const numLinks = await LinkModel.count({
        where: { id_task: task.id_task } // all links from the task will be part of the pretask
    });
    const numQuestions = await QuestionModel.count({
        where: { id_task_stage: pretask.id_task_stage }
    });
    
    return {
        description: pretask.description,
        keywords: pretask.keywords || '',
        numLinks,
        numQuestions
    };
}

export async function getDuringtask(taskOrder: number): Promise<DuringtaskResp> {
    const task = (await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    }));
    if (!task) throw new Error('Task not found');
    
    const pretask = await TaskStageModel.findOne({
        attributes: ['id_task_stage', 'description', 'keywords'],
        where: { id_task: task.id_task, task_stage_order: 2 }
    });
    if (!pretask) throw new Error('Pretask not found');
    const numQuestions = await QuestionModel.count({
        where: { id_task_stage: pretask.id_task_stage }
    });
    
    return {
        description: pretask.description,
        keywords: pretask.keywords || '',
        numQuestions
    };
}

export async function getPostask(taskOrder: number): Promise<PostaskResp> {
    const task = (await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    }));
    if (!task) throw new Error('Task not found');
    
    const pretask = await TaskStageModel.findOne({
        attributes: ['id_task_stage', 'description', 'keywords'],
        where: { id_task: task.id_task, task_stage_order: 3 }
    });
    if (!pretask) throw new Error('Pretask not found');
    const numQuestions = await QuestionModel.count({
        where: { id_task_stage: pretask.id_task_stage }
    });
    
    return {
        description: pretask.description,
        keywords: pretask.keywords || '',
        numQuestions
    };
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