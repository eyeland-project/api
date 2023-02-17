import { Request, Response } from 'express';
import multer from 'multer';
import { getQuestionByOrder } from '../../services/question.service';
import { getPostask } from '../../services/task.service';
import { DuringtaskQuestionResp, PostaskResp } from '../../types/responses/students.types';
import { getQuestionOptions } from '../../services/option.service';
import { createAnswer } from '../../services/answer.service';
import { AnswerAudioReq, AnswerOptionReq } from '../../types/requests/students.types';

export async function root(req: Request<{ taskOrder: number }>, res: Response<PostaskResp>) {
    const { taskOrder } = req.params;
    res.status(200).json(await getPostask(taskOrder));
}

export async function getQuestion(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response<DuringtaskQuestionResp>) {
    const { taskOrder, questionOrder } = req.params;
    
    const { id_question, content, type, img_alt, img_url, audio_url, video_url } = await getQuestionByOrder(taskOrder, 2, questionOrder);
    const options = await getQuestionOptions(id_question);

    res.status(200).json({
        content, type,
        id: id_question,
        imgAlt: img_alt || '',
        imgUrl: img_url || '',
        audioUrl: audio_url || '',
        videoUrl: video_url || '',
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

    const question = await getQuestionByOrder(taskOrder, 2, questionOrder);
    
    if (question.type === 'select') {
        const { answerSeconds, idOption } = req.body as AnswerOptionReq;
        await createAnswer(idUser, taskOrder, 1, questionOrder, idOption, answerSeconds);
    } else if (question.type === 'audio') {
        // const { answerSeconds, audio1, audio2 } = req.body as AnswerAudioReq;
        // const storage = multer.memoryStorage();
        // const upload = multer({ storage });
        // const file = req.file;
        // const userId = req.body.userId;
    }
    res.status(200).json({ message: `Answered question ${questionOrder} of task ${taskOrder}` });
}
