/// <reference path="../../types/customTypes.d.ts" />

import { Request, Response } from 'express';
import { getStudentTasks, getTaskIntro } from '../../services/task.service';
import { Task } from '../../types/Task.types';
import { TaskResp } from '../../types/respSchemas/student/TaskResp.types';
import { IntroductionResp } from '../../types/respSchemas/student/IntroductionResp';

type Introduction = {
    id: number,
    name: string,
    description: string,
    taskOrder: number,
    thumbnail: string,
    keywords: string[],
    longDescription: string
}

export async function root(req: Request, res: Response<TaskResp[]>) {
    const user = req.user as ReqUser;
    res.status(200).json(await getStudentTasks(user.id));
}

export async function getIntro(req: Request<{ taskOrder: number }>, res: Response<IntroductionResp>) {
    const { taskOrder } = req.params;
    res.status(200).json(await getTaskIntro(taskOrder));
}

export async function start(req: Request<{ taskOrder: number }>, res: Response<{ message: string }>) {
    // const { taskOrder } = req.params;
    res.status(200).json({ message: 'Ok' });
}
