import OptionModel from "../models/Option";
import QuestionModel from "../models/Question";
import TaskModel from "../models/Task";
import TaskPhaseModel from "../models/TaskPhase";
import { PretaskQuestionResp } from "../types/responses/students.types";

export async function getPretaskQuestion(taskOrder: number, questionOrder: number): Promise<PretaskQuestionResp> {
    const task = await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    });
    if (!task) throw new Error('Task not found');
    
    const pretask = await TaskPhaseModel.findOne({
        attributes: ['id_task_phase'],
        where: { id_task: task.id_task, task_phase_order: 1 }
    });
    if (!pretask) throw new Error('Pretask not found');
    
    const question = await QuestionModel.findOne({
        attributes: ['id_question', 'content', 'type', 'img_alt', 'img_url'],
        where: { id_task_phase: pretask.id_task_phase, question_order: questionOrder }
    });
    if (!question) throw new Error('Link not found');

    const options = await OptionModel.findAll({
        attributes: ['id_option', 'content', 'correct', 'feedback'],
        where: { id_question: question.id_question }
    });

    return {
        id: question.id_question,
        content: question.content,
        type: question.type,
        imgAlt: question.img_alt || '',
        imgUrl: question.img_url || '',
        options: options.map(option => ({
            id: option.id_option,
            content: option.content,
            correct: option.correct,
            feedback: option.feedback || ''
        }))
    }
}

