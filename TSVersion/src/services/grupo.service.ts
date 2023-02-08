import Team from "../models/Team";
import { GrupoModel } from "../types/Team.types";
import { taskCount, getTaskQuestionsByOrder } from "./task.service";

export async function disponibleTasks(groupId: number): Promise<any> {
    const group: GrupoModel | null = await Team.findByPk(groupId);

    if (!group) throw Error('Group not found')
    const numberOfTasks = await taskCount();
    return {
        "numberOfTasks": numberOfTasks,
        "availableTasks": Math.min(group.availableTasks, numberOfTasks)
    }
}

//! NEED TO BE FIXED WHEN HISTORIAL IS IMPLEMENTED
export async function preguntasDisponibles(groupId: number, taskOrder: number): Promise<any> {
    const group: GrupoModel | null = await Team.findByPk(groupId);

    if (!group) throw Error('Group not found')
    
    const questions = (await getTaskQuestionsByOrder(taskOrder));

    if(!questions){
        return null;
    }

    const numberOfQuestions = questions.length;
    return {
        "numberOfQuestions": numberOfQuestions,
        "availableQuestions": numberOfQuestions
    }
}