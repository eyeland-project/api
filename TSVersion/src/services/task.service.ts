import Tasks from "../models/Tasks";

export async function taskCount(): Promise<number> {
    return await Tasks.count();
}

export async function getAllLinksByOrder(taskOrder: number): Promise<any> {
    throw new Error("Method not implemented.");
    return await Tasks.findOne({where: {orden: taskOrder}});
}