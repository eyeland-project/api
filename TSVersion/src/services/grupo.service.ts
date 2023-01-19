import Grupos from "../models/Grupos";
import { Grupo } from "../types/Grupos.types";
import { taskCount } from "./task.service";
export async function disponibleTasks(groupId: number): Promise<any> {
    const group: Grupo | null = await Grupos.findByPk(groupId);

    if (!group) throw Error('Group not found')
    const numberOfTasks = await taskCount();
    return {
        "numberOfTasks": numberOfTasks,
        "availableTasks": Math.min(group.availableTasks, numberOfTasks)
    }
}