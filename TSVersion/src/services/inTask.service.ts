import Preguntas from '../models/Preguntas';
// import { Pregunta } from '../types/Preguntas.types';

export async function getQuestionOrder(taskOrder: number, questionOrder: number): Promise<any> {
    const pregunta = await Preguntas.findOne({
        where: {
            order: questionOrder,
            '$task.order$': taskOrder
        },//
    });

    if (!pregunta) throw Error('Question not found')

    return pregunta;
}