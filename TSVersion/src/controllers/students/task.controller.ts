/// <reference path="../../types/customTypes.d.ts" />

import { Request, Response } from 'express';
import { getTasksFromStudentWithCompleted, getTaskByOrder } from '../../services/task.service';
import { TaskResp, TaskIntroResp, TaskProgressResp } from '../../types/responses/students.types';
import { getStudentTaskProgressByOrder } from '../../services/studentTask.service';
import { finishStudentPrevTaskAttempts } from '../../services/taskAttempt.service';

export async function root(req: Request, res: Response<TaskResp[]>, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
        res.status(200).json(await getTasksFromStudentWithCompleted(idUser));
    } catch (err) {
        next(err);
    }
}

export async function getIntro(req: Request<{ taskOrder: number }>, res: Response<TaskIntroResp>, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
        const { taskOrder } = req.params;
        
        try {
            await finishStudentPrevTaskAttempts(idUser); // Finish all previous task attempts (await may not be necessary)
        } catch (err) {
            console.error(err);
        }
        
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

export async function getProgress(req: Request<{ taskOrder: number }>, res: Response<TaskProgressResp[]>, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
        const { taskOrder } = req.params;
        res.status(200).json(await getStudentTaskProgressByOrder(taskOrder, idUser));
    } catch (err) {
        next(err);
    }
}

export async function finishAttempt(req: Request<{ taskOrder: number }>, res: Response, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
        await finishStudentPrevTaskAttempts(idUser);
        res.status(200).json({ message: 'OK' });
    } catch (err) {
        next(err);
    }
}
