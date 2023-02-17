import { AnswerModel } from "../models";
import { Answer } from "../types/database/Answer.types";
import { getQuestionByOrder } from "./question.service";
import { getTaskByOrder } from "./task.service";
import { createTaskAttempt, getStudentCurrTaskAttempt } from "./taskAttempt.service";

export async function createAnswer(
    idStudent: number,
    taskOrder: number,
    taskStageOrder: number,
    questionOrder: number,
    idOption: number,
    answerSeconds: number,
): Promise<Answer> {
    const { id_question } = await getQuestionByOrder(taskOrder, taskStageOrder, questionOrder);
    let idTaskAttempt;
    try {
        idTaskAttempt = (await getStudentCurrTaskAttempt(idStudent)).id_task_attempt;
    } catch(err) {
        const { id_task } = await getTaskByOrder(taskOrder);
        idTaskAttempt = (await createTaskAttempt(idStudent, id_task)).id_task_attempt;
    }

    const answer = await AnswerModel.create({
        id_question,
        id_task_attempt: idTaskAttempt,
        id_option: idOption,
        answer_seconds: answerSeconds,
    });
    return answer;
}
