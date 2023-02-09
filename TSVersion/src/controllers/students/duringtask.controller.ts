import { Request, Response } from 'express';

type Pretask = {
    message: string,
    numQuestions: number,
    numLinks: number
};

type Question = {
    id: number,
    content: string,
    type: string,
    imgAlt: string,
    imgUrl: string,
    options: {
        id: number,
        content: string,
        correct: boolean,
        feedback: string
    }[]
};

type Answer = {
    idOption: number,
    idTaskAttempt: number,
    startTime: Date,
    endTime: Date
};

type Questions = {
    numQuestions: number,
    availableQuestions: number
};

export async function root(req: Request<{ taskOrder: number }>, res: Response<Pretask>) {
    const { taskOrder } = req.params;

    res.status(200).json({
        message: `This is the pretask for task ${taskOrder}`,
        numQuestions: 2,
        numLinks: 3
    });
}

export async function getQuestions(req: Request<{ taskOrder: number }>, res: Response<Questions>) {
    // const { taskOrder } = req.params;
    res.status(200).json({
        numQuestions: 2,
        availableQuestions: 2
    });
}

export async function getQuestion(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response<Question>) {
    const { taskOrder, questionOrder } = req.params;
    res.status(200).json(Array.from({ length: 5 }, () => ([
        {
            id: 1,
            content: 'What is the meaning of the word "in" in the following sentence? "I live in London."',
            type: 'select',
            imgAlt: 'Image alt',
            imgUrl: 'https://picsum.photos/300/200',
            options: [
                {
                    id: 1,
                    content: 'React >>> Angular',
                    correct: true,
                    feedback: 'Everyone knows that React is better than Angular'
                },
                {
                    id: 2,
                    content: 'eeeeehhh Messi',
                    correct: false,
                    feedback: 'Incorrect'
                },
                {
                    id: 3,
                    content: 'Yes',
                    correct: false,
                    feedback: 'jsjsjs'
                }
            ]
        },
        {
            id: 2,
            content: 'How many times have you been to Spain?',
            type: 'select',
            imgAlt: 'Image alt',
            imgUrl: 'https://picsum.photos/300/200',
            options: [
                {
                    id: 1,
                    content: 'Yes, I have',
                    correct: false,
                    feedback: 'Incorrect'
                },
                {
                    id: 2,
                    content: 'No, I haven\'t',
                    correct: true,
                    feedback: 'Correct'
                },
                {
                    id: 3,
                    content: 'I\'ve never been to Spain',
                    correct: false,
                    feedback: 'Incorrect'
                }
            ]
        }
    ]))[taskOrder - 1][questionOrder - 1]);
}

export async function answer(req: Request<{ taskOrder: number, questionOrder: number }>, res: Response) {
    const { taskOrder, questionOrder } = req.params;
    const { idOption, idTaskAttempt, startTime, endTime } = req.body as Answer;
    // TODO: Save answer to database
    res.status(200).json({ message: `Answered question ${questionOrder} of task ${taskOrder}` });
}
