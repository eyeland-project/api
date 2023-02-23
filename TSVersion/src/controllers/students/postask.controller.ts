import { Request, Response } from 'express';
import multer from 'multer';
import { getQuestionByOrder, getTaskStageQuestionsCount } from '../../services/question.service';
import { DuringtaskQuestionResp, PostaskResp } from '../../types/responses/students.types';
import { getQuestionOptions } from '../../services/option.service';
import { createAnswerOption } from '../../services/answer.service';
import { AnswerAudioReq, AnswerOptionReq } from '../../types/requests/students.types';
import { getTaskStageByOrder } from '../../services/taskStage.service';
import { createTaskAttempt, finishStudTaskAttempts, getStudCurrTaskAttempt } from '../../services/taskAttempt.service';
import { getTaskByOrder } from '../../services/task.service';

export async function root(req: Request<{ taskOrder: number }>, res: Response<PostaskResp>, next: Function) {
    try {
        const { taskOrder } = req.params;
        const { description, keywords, id_task, id_task_stage } = await getTaskStageByOrder(taskOrder, 1);
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

export async function answer(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response, next: Function) {
    try {
        const { id: idStudent } = req.user!;
        const { taskOrder, questionOrder } = req.params;

        const { type: questionType } = await getQuestionByOrder(taskOrder, 2, questionOrder);

        if (questionType === 'select') {
            const { answerSeconds, idOption, newAttempt } = req.body as AnswerOptionReq;
            if (!idOption) return res.status(400).json({ message: 'Missing idOption' });

            let idTaskAttempt;
            if (newAttempt) {
                await finishStudTaskAttempts(idStudent);
                const { id_task } = await getTaskByOrder(taskOrder);
                idTaskAttempt = (await createTaskAttempt(idStudent, id_task, null)).id_task_attempt;
            } else {
                idTaskAttempt = (await getStudCurrTaskAttempt(idStudent)).id_task_attempt;
            }
            await createAnswerOption(taskOrder, 3, questionOrder, idOption, answerSeconds, idTaskAttempt);
        } else if (questionType === 'audio') {
            // const { answerSeconds, audio } = req.body as AnswerAudioReq;
            // const storage = multer.memoryStorage();
            // const upload = multer({ storage });
            // const file = req.file;
            // const userId = req.body.userId;
        }
        res.status(200).json({ message: `Answered question ${questionOrder} of task ${taskOrder}` });
    } catch (err) {
        next(err);
    }
}
