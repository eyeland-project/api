import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { Question } from "../types/database/Question.types";

export async function getQuestionByOrder(taskOrder: number, taskStageOrder: number, questionOrder: number): Promise<Question> {
    const questions = await sequelize.query(`
        SELECT q.id_question, q.id_task_stage, q.question_order, q.content, q.audio_url, q.video_url, q.type, q.img_alt, q.img_url
        FROM question q
        JOIN task_stage ts ON q.id_task_stage = ts.id_task_stage
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder} AND q.question_order = ${questionOrder}
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as Question[];
    if (!questions.length) throw new Error('Question not found');
    return questions[0];
}
