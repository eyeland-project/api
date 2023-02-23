import { Request, Response } from 'express';
import { getQuestionByOrder, getTaskStageQuestionsCount } from '../../services/question.service';
import { DuringtaskQuestionResp, DuringtaskResp } from '../../types/responses/students.types';
import { getQuestionOptions } from '../../services/option.service';
import { duringtaskAvailable, getTaskStageByOrder } from '../../services/taskStage.service';
import { ApiError } from '../../middlewares/handleErrors';
import { createTaskAttempt, getStudCurrTaskAttempt } from '../../services/taskAttempt.service';

export async function root(req: Request<{ taskOrder: number }>, res: Response<DuringtaskResp>, next: Function) {
    try {
        const { taskOrder } = req.params;
        const { description, keywords, id_task_stage } = await getTaskStageByOrder(taskOrder, 1);
        res.status(200).json({
            description: description,
            keywords: keywords,
            numQuestions: await getTaskStageQuestionsCount(id_task_stage)
        });
    } catch (err) {
        next(err);
    }
}

export async function getQuestion(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response<DuringtaskQuestionResp>, next: Function) {
    try {
        const { id: idStudent } = req.user!;
        if (!await duringtaskAvailable(idStudent)) throw new ApiError('DuringTask is not available', 400);
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
    } catch (err) {
        next(err);
    }
}

export async function answer(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response) {
    // const { taskOrder, questionOrder } = req.params;
    // const { idOption, idTaskAttempt, answerSeconds } = req.body as AnswerOptionReq;
    // await createAnswer(taskOrder, 2, questionOrder, idOption, idTaskAttempt, answerSeconds);
    // res.status(200).json({ message: `Answered question ${questionOrder} of task ${taskOrder}` });
}
