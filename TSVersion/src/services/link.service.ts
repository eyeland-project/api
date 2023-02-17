import { LinkModel, TaskModel } from "../models";
import { Link } from "../types/database/Link.types";
import { PretaskLinkResp } from "../types/responses/students.types";

export async function getLinkByOrder(taskOrder: number, linkOrder: number): Promise<Link> {
    const task = await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    });
    if (!task) throw new Error('Task not found');
    const link = await LinkModel.findOne({
        // attributes: ['id_link', 'topic', 'url'],
        where: { id_task: task.id_task, link_order: linkOrder }
    });
    if (!link) throw new Error('Link not found');

    return link;
}
