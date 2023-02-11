import { Request, Response } from 'express';
import { getPretaskLink } from '../../services/link.service';
import { getPretaskQuestion } from '../../services/question.service';
import { getPretask } from '../../services/task.service';
import { PretaskLinkResp, PretaskQuestionResp, PretaskResp } from '../../types/responses/students.types';

type Answer = {
    idOption: number,
    idTaskAttempt: number,
    startTime: Date,
    endTime: Date
};

export async function root(req: Request<{ taskOrder: number }>, res: Response<PretaskResp>) {
    const { taskOrder } = req.params;
    res.status(200).json(await getPretask(taskOrder));
}

export async function getLink(req: Request<{ taskOrder: number, linkOrder: number }>, res: Response<PretaskLinkResp>) {
    const { taskOrder, linkOrder } = req.params;
    res.status(200).json(await getPretaskLink(taskOrder, linkOrder));
}

export async function getQuestion(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response<PretaskQuestionResp>) {
    const { taskOrder, questionOrder } = req.params;
    res.status(200).json(await getPretaskQuestion(taskOrder, questionOrder));
}

export async function answer(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response) {
    const { taskOrder, questionOrder } = req.params;
    const { idOption, idTaskAttempt, startTime, endTime } = req.body as Answer;
    // TODO: Save answer to database
    res.status(200).json({ message: `Answered question ${questionOrder} of task ${taskOrder}` });
}
