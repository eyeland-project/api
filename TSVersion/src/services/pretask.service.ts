import LinkModel from '../models/Link';
import QuestionModel from '../models/Question';
import TaskModel from '../models/Task';
import TaskPhaseModel from '../models/TaskPhase';
import { PretaskResp } from '../types/responses/students.types';

export async function getSummary(taskOrder: number): Promise<PretaskResp> {
    const task = (await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    }));
    if (!task) throw new Error('Task not found');
    
    const pretask = await TaskPhaseModel.findOne({
        attributes: ['id_task_phase', 'name', 'description', 'long_description', 'thumbnail_url', 'keywords'],
        where: { id_task: task.id_task, task_phase_order: 1 }
    });
    if (!pretask) throw new Error('Pretask not found');

    const numLinks = await LinkModel.count({
        where: { id_task: task.id_task } // all links from the task will be part of the pretask
    });
    const numQuestions = await QuestionModel.count({
        where: { id_task_phase: pretask.id_task_phase }
    });
    
    return {
        name: pretask.name,
        description: pretask.description,
        longDescription: pretask.long_description || '',
        keywords: pretask.keywords || '',
        thumbnailUrl: pretask.thumbnail_url || '',
        numLinks,
        numQuestions
    };
}
