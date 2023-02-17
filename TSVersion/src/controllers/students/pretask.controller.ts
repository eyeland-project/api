import { Request, Response } from 'express';
import { getLinkByOrder } from '../../services/link.service';
import { getQuestionByOrder } from '../../services/question.service';
import { getPretask } from '../../services/task.service';
import { PretaskLinkResp, PretaskQuestionResp, PretaskResp } from '../../types/responses/students.types';
import { getQuestionOptions } from '../../services/option.service';
import { AnswerOptionReq } from '../../types/requests/students.types';
import { createAnswer } from '../../services/answer.service';

export async function root(req: Request<{ taskOrder: number }>, res: Response<PretaskResp>) {
    const { taskOrder } = req.params;
    res.status(200).json(await getPretask(taskOrder));
}

export async function getLink(req: Request<{ taskOrder: number, linkOrder: number }>, res: Response<PretaskLinkResp>) {
    const { taskOrder, linkOrder } = req.params;
    const { id_link, topic, url } = await getLinkByOrder(taskOrder, linkOrder);
    res.status(200).json({ id: id_link, topic, url });
}

export async function getQuestion(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response<PretaskQuestionResp>) {
    const { taskOrder, questionOrder } = req.params;
    
    const { id_question, content, type, img_alt, img_url } = await getQuestionByOrder(taskOrder, 1, questionOrder);
    const options = await getQuestionOptions(id_question);

    res.status(200).json({
        content, type,
        id: id_question,
        imgAlt: img_alt || '',
        imgUrl: img_url || '',
        options: options.map(({ id_option, content, correct, feedback }) => ({
            id: id_option,
            content,
            correct,
            feedback: feedback || ''
        })),
    });
}

export async function answer(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response) {
    const { id: idUser } = req.user as ReqUser;
    const { taskOrder, questionOrder } = req.params;
    const { idOption, answerSeconds } = req.body as AnswerOptionReq;
    if (!idOption) return res.status(400).json({ message: 'Missing idOption' });
    
    await createAnswer(idUser, taskOrder, 1, questionOrder, idOption, answerSeconds);
    res.status(200).json({ message: `Answered question ${questionOrder} of task ${taskOrder}` });
}
