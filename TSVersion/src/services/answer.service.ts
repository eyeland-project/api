import { AnswerModel } from "../models";
import { Answer } from "../types/database/Answer.types";
import { getQuestionByOrder } from "./question.service";

export async function createAnswerOption(
    taskOrder: number,
    taskStageOrder: number,
    questionOrder: number,
    idOption: number,
    answerSeconds: number,
    idTaskAttempt: number
): Promise<Answer> {
    const { id_question } = await getQuestionByOrder(taskOrder, taskStageOrder, questionOrder);
    const answer = await AnswerModel.create({
        id_question,
        id_task_attempt: idTaskAttempt,
        id_option: idOption,
        answer_seconds: answerSeconds,
    });
    return answer;
}
