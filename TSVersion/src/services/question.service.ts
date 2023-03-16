import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { QuestionModel } from "../models";
import { Question } from "../types/Question.types";
import { ApiError } from "../middlewares/handleErrors";
import { Answer } from "../types/Answer.types";

export async function getAnswerFromQuestionOfAttempt(idTaskAttempt: number, idQuestion: number): Promise<Answer> {
    const answers = await sequelize.query<Answer>(`
        SELECT a.* FROM answer a
        WHERE a.id_question = ${idQuestion} AND a.id_task_attempt = ${idTaskAttempt}
        LIMIT 1;
    `, { type: QueryTypes.SELECT });
    if (!answers.length) throw new ApiError('Answer not found', 404);
    return answers[0];
}

export async function getQuestionByOrder(
    taskOrder: number,
    taskStageOrder: number,
    questionOrder: number
): Promise<Question> {
    const questions = await sequelize.query(`
        SELECT q.* FROM question q
        JOIN task_stage ts ON q.id_task_stage = ts.id_task_stage
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder} AND q.question_order = ${questionOrder}
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as Question[];
    if (!questions.length) throw new ApiError('Question not found', 404);
    return questions[0];
}

export async function getTaskStageQuestionsCount(idTaskStage: number): Promise<number> {
    return await QuestionModel.count({ where: { id_task_stage: idTaskStage } });
}
