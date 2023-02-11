/// <reference path="../../types/customTypes.d.ts" />

import { Request, Response } from 'express';
import { getStudentTasksOrdered } from '../../services/task.service';
import { Task } from '../../types/Task.types';
import { TaskResp } from '../../types/respSchemas/student/Task.types';

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
    res.status(200).json(await getStudentTasksOrdered(user.id));
}

export function getIntro(req: Request<{ taskOrder: number }>, res: Response<Introduction>) {
    const { taskOrder } = req.params;

    res.status(200).json(Array.from({ length: 5 }, (_, i) => ({
        id: i,
        name: `Task ${i}`,
        description: `This is a description for Task ${i}.`,
        taskOrder: i + 1,
        thumbnail: 'https://picsum.photos/200/300',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        longDescription: `This is a long description for Task ${i}. Like, really long. I mean, really, really long. I mean, really, really, really long. I mean, really, really, really, really long. I mean, really, really, really, really, really long. I mean, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really, really, really, really, really, really, really, really long. I mean, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really long. I mean, really.`
    }))[taskOrder - 1]);
}

export function start(req: Request<{ taskOrder: number }>, res: Response<{ message: string }>) {
    // const { taskOrder } = req.params;
    res.status(200).json({ message: 'Ok' });
}
