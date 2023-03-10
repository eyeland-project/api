import { Request, Response } from "express";
import {
    getQuestionByOrder,
    getTaskStageQuestionsCount,
} from "../../services/question.service";
import {
    DuringtaskQuestionResp,
    DuringtaskResp,
} from "../../types/responses/students.types";
import {
    getOptionById,
    getQuestionOptions,
} from "../../services/option.service";
import {
    duringtaskAvailable,
    getTaskStageByOrder,
} from "../../services/taskStage.service";
import { ApiError } from "../../middlewares/handleErrors";
import {
    createTaskAttempt,
    getStudCurrTaskAttempt,
} from "../../services/taskAttempt.service";
import {
    translateFormat,
    distributeOptions,
    shuffle,
    indexPower,
} from "../../utils";
import {
    getTeamFromStudent,
    getTeammates,
} from "../../services/student.service";
import { OutgoingEvents, Power } from "../../types/enums";
import { getMembersFromTeam } from "../../services/team.service";
import { AnswerOptionReq } from "../../types/requests/students.types";
import { createAnswer } from "../../services/answer.service";
import { directory } from "../../listeners/namespaces/students";

export async function root(
    req: Request<{ taskOrder: number }>,
    res: Response<DuringtaskResp>,
    next: Function
) {
    try {
        const { taskOrder } = req.params;
        const { description, keywords, id_task_stage } =
            await getTaskStageByOrder(taskOrder, 1);
        res.status(200).json({
            description: description,
            keywords: keywords,
            numQuestions: await getTaskStageQuestionsCount(id_task_stage),
        });
    } catch (err) {
        next(err);
    }
}

export async function getQuestion(
    req: Request<{ taskOrder: number; questionOrder: number }>,
    res: Response<DuringtaskQuestionResp>,
    next: Function
) {
    try {
        const { id: idStudent } = req.user!;
        // if (!await duringtaskAvailable(idStudent)) throw new ApiError('DuringTask is not available', 400);
        const { taskOrder, questionOrder } = req.params;

        const {
            id_question,
            content,
            type,
            img_alt,
            img_url,
            audio_url,
            video_url,
        } = await getQuestionByOrder(taskOrder, 2, questionOrder);
        let options = await getQuestionOptions(id_question);

        const { nouns, preps } = await translateFormat(content);
        //- const { id_team, power } = await getStudCurrTaskAttempt(idStudent);

        // * If student has no team, send error
        //- if (!id_team || !power){
        //-     throw new ApiError('No team or power found', 400);
        //- }
        //- const members = (await getTeammates(idStudent, {idTeam: id_team})).map(({ task_attempt }) => task_attempt.power);
        //- members.push(power);
        //- members.sort((a, b) => indexPower(a) - indexPower(b));

        // * shuffle options
        //- options = shuffle(options, id_team);
        // * distribute options based on power
        //- options = distributeOptions(options, members.indexOf(power) + 1, members.length);

        res.status(200).json({
            content,
            type,
            id: id_question,
            imgAlt: img_alt || "",
            imgUrl: img_url || "",
            audioUrl: audio_url || "",
            videoUrl: video_url || "",
            nounTranslation: nouns,
            prepositionTranslation: preps,
            options: options.map(
                ({ id_option, content, correct, feedback }) => ({
                    id: id_option,
                    content,
                    correct,
                    feedback: feedback || "",
                })
            ),
        });
    } catch (err) {
        next(err);
    }
}

export async function answer(
    req: Request<
        { taskOrder: number; questionOrder: number },
        any,
        AnswerOptionReq
    >,
    res: Response
) {
    const { taskOrder, questionOrder } = req.params;
    const { idOption, answerSeconds } = req.body;
    const { id: idStudent } = req.user!;

    // - Check if duringtask is available
    if (!(await duringtaskAvailable(idStudent)))
        throw new ApiError("DuringTask is not available", 400);

    // - Check if question exists and is in the correct task stage, and get question_id
    const { id_question } = await getQuestionByOrder(
        taskOrder,
        2,
        questionOrder
    );

    // - Check if option exists and is in the correct question
    const { id_option, correct } = await getOptionById(idOption);
    if (id_option !== id_question) throw new ApiError("Option not found", 404);

    // - get student's current task attempt and get student's team id from task attempt
    const { id_team, id_task_attempt } = await getStudCurrTaskAttempt(
        idStudent
    );

    // TODO: inform team members that student has answered
    const studentSocket = directory.get(idStudent);
    if (!studentSocket) throw new ApiError("Student not found", 404);
    studentSocket.broadcast.to(`t${id_team}`).emit(OutgoingEvents.Answer, {
        correct,
    });

    // - create the answer
    /*
    await createAnswer({
        id_question,
        id_option: idOption,
        id_task_attempt,
        answer_seconds: answerSeconds,
        id_team
    })
    // */
    res.json({
        message: "Answered",
    });
}
