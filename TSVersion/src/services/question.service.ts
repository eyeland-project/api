import { OptionModel, QuestionModel, TaskModel, TaskStageModel } from "../models";
import { DuringtaskQuestionResp, PostaskQuestionResp, PretaskQuestionResp } from "../types/responses/students.types";

export async function getPretaskQuestion(taskOrder: number, questionOrder: number): Promise<PretaskQuestionResp> {
    const task = await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    });
    if (!task) throw new Error('Task not found');
    
    const pretask = await TaskStageModel.findOne({
        attributes: ['id_task_stage'],
        where: { id_task: task.id_task, task_stage_order: 1 }
    });
    if (!pretask) throw new Error('Pretask not found');
    
    const question = await QuestionModel.findOne({
        attributes: ['id_question', 'content', 'type', 'img_alt', 'img_url'],
        where: { id_task_stage: pretask.id_task_stage, question_order: questionOrder }
    });
    if (!question) throw new Error('Question not found');

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

export async function getDuringtaskQuestion(taskOrder: number, questionOrder: number): Promise<DuringtaskQuestionResp> {
    const task = await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    });
    if (!task) throw new Error('Task not found');
    
    const duringtask = await TaskStageModel.findOne({
        attributes: ['id_task_stage'],
        where: { id_task: task.id_task, task_stage_order: 2 }
    });
    if (!duringtask) throw new Error('Pretask not found');
    
    const question = await QuestionModel.findOne({
        attributes: ['id_question', 'content', 'type', 'img_alt', 'img_url', 'audio_url', 'video_url'],
        where: { id_task_stage: duringtask.id_task_stage, question_order: questionOrder }
    });
    if (!question) throw new Error('Question not found');

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
        audioUrl: question.audio_url || '',
        videoUrl: question.video_url || '',
        options: options.map(option => ({
            id: option.id_option,
            content: option.content,
            correct: option.correct,
            feedback: option.feedback || ''
        }))
    }
}

export async function getPostaskQuestion(taskOrder: number, questionOrder: number): Promise<PostaskQuestionResp> {
    const task = await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    });
    if (!task) throw new Error('Task not found');
    
    const duringtask = await TaskStageModel.findOne({
        attributes: ['id_task_stage'],
        where: { id_task: task.id_task, task_stage_order: 3 }
    });
    if (!duringtask) throw new Error('Pretask not found');
    
    const question = await QuestionModel.findOne({
        attributes: ['id_question', 'content', 'type', 'img_alt', 'img_url', 'audio_url', 'video_url'],
        where: { id_task_stage: duringtask.id_task_stage, question_order: questionOrder }
    });
    if (!question) throw new Error('Question not found');

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
        audioUrl: question.audio_url || '',
        videoUrl: question.video_url || '',
        options: options.map(option => ({
            id: option.id_option,
            content: option.content,
            correct: option.correct,
            feedback: option.feedback || ''
        }))
    }
}
