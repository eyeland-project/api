import { Request, Response } from 'express';
import { getPostaskQuestion } from '../../services/question.service';
import { getPostask } from '../../services/task.service';
import { PostaskQuestionResp, PostaskResp } from '../../types/responses/students.types';

type Answer = {
    idOption: number,
    idTaskAttempt: number,
    startTime: Date,
    endTime: Date
};

export async function root(req: Request<{ taskOrder: number }>, res: Response<PostaskResp>) {
    const { taskOrder } = req.params;
    res.status(200).json(await getPostask(taskOrder));
}

export async function getQuestion(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response<PostaskQuestionResp>) {
    const { taskOrder, questionOrder } = req.params;
    res.status(200).json(await getPostaskQuestion(taskOrder, questionOrder));
}

export async function answer(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response) {
    const { taskOrder, questionOrder } = req.params;
    const { idOption, idTaskAttempt, startTime, endTime } = req.body as Answer;
    // TODO: Save answer to database
    res.status(200).json({ message: `Answered question ${questionOrder} of task ${taskOrder}` });
}
