/// <reference path="../../types/customTypes.d.ts" />

import { Request, Response } from 'express';
import { getStudentTasks, getTaskByOrder } from '../../services/task.service';
import { TaskResp, IntroductionResp } from '../../types/responses/students.types';

export async function root(req: Request, res: Response<TaskResp[]>, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
        res.status(200).json(await getStudentTasks(idUser));
    } catch (err) {
        next(err);
    }
}

export async function getIntro(req: Request<{ taskOrder: number }>, res: Response<IntroductionResp>, next: Function) {
    const { taskOrder } = req.params;
    try {
        const task = await getTaskByOrder(taskOrder);
        res.status(200).json({
            id: task.id_task,
            name: task.name,
            description: task.description,
            taskOrder: task.task_order,
            thumbnailUrl: task.thumbnail_url || '',
            keywords: task.keywords,
            longDescription: task.long_description || ''
        });
    } catch (err) {
        next(err);
    }
}
