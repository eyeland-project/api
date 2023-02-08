import Question from '../models/Question';
import { Pregunta } from '../types/Question.types';
// import { Pregunta } from '../types/Preguntas.types';

export async function getQuestionOrder(taskOrder: number, questionOrder: number): Promise<any> {
    const pregunta = await Question.findOne({
        where: {
            orden: questionOrder,
            '$task.order$': taskOrder,
            examen: false,
        },//
    });

    if (!pregunta) throw Error('Question not found')

    return pregunta;
}

export async function getQuestions(properties: Partial<Pregunta>): Promise<any> {
    return await Question.findAll({
        where: {
            ...properties,
            examen: false,
        }
    });
}