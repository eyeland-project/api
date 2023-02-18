import { ApiError } from "../middlewares/handleErrors";
import { LinkModel, TaskModel } from "../models";
import { Link } from "../types/database/Link.types";

export async function getLinkByOrder(taskOrder: number, linkOrder: number): Promise<Link> {
    const task = await TaskModel.findOne({
        attributes: ['id_task'],
        where: { task_order: taskOrder }
    });
    if (!task) throw new ApiError('Task not found', 404);
    const link = await LinkModel.findOne({
        // attributes: ['id_link', 'topic', 'url'],
        where: { id_task: task.id_task, link_order: linkOrder }
    });
    if (!link) throw new ApiError('Link not found', 404);

    return link;
}

export async function getTaskLinksCount(idTask: number): Promise<number> {
    return await LinkModel.count({ where: { id_task: idTask } });
}
