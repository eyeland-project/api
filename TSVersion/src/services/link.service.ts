import { LinkModel, TaskModel } from "../models";
import { PretaskLinkResp } from "../types/responses/students.types";

export async function getPretaskLink(taskOrder: number, linkOrder: number): Promise<PretaskLinkResp> {
    const task = await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    });
    if (!task) throw new Error('Task not found');
    const link = await LinkModel.findOne({
        attributes: ['id_link', 'topic', 'url'],
        where: { id_task: task.id_task, link_order: linkOrder }
    });
    if (!link) throw new Error('Link not found');

    return {
        id: link.id_link,
        topic: link.topic,
        url: link.url
    }
}
