import Preguntas from '../models/Preguntas';
import { Pregunta } from '../types/Preguntas.types';
// import { Pregunta } from '../types/Preguntas.types';

export async function getQuestionOrder(taskOrder: number, questionOrder: number): Promise<any> {
    const pregunta = await Preguntas.findOne({
        where: {
            orden: questionOrder,
            '$task.order$': taskOrder,
            examen: true,
            tipo: 'multiple',
        },//
    });

    if (!pregunta) throw Error('Question not found')

    return pregunta;
}

export async function getAudioQuestionOrder(taskOrder: number): Promise<any> {
    const pregunta = await Preguntas.findOne({
        where: {
            '$task.order$': taskOrder,
            examen: true,
            tipo: 'audio',
        },//
    });

    if (!pregunta) throw Error('Question not found')

    return pregunta;
}

export async function getQuestions(properties: Partial<Pregunta>): Promise<any> {
    return await Preguntas.findAll({
        where: {
            ...properties,
            examen: true,
            tipo: 'multiple',
        }
    });
}