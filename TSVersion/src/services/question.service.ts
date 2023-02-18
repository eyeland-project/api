import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { QuestionModel } from "../models";
import { Question } from "../types/database/Question.types";
import { ApiError } from "../middlewares/handleErrors";

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
    
    // const question = await QuestionModel.findOne({
    //     attributes: ['*'],
    //     include: [{
    //       model: TaskStageModel,
    //       attributes: [],
    //       where: { task_stage_order: taskStageOrder },
    //       include: [{
    //         model: TaskModel,
    //         attributes: [],
    //         where: { task_order: taskOrder }
    //       }]
    //     }],
    //     where: { question_order: questionOrder }
    //   });
    // if (!question) throw new Error('Question not found');
    // console.log(question);
    // console.log(question.save);
    // return question;
}

export async function getTaskStageQuestionsCount(idTaskStage: number): Promise<number> {
    return await QuestionModel.count({ where: { id_task_stage: idTaskStage } });
}
