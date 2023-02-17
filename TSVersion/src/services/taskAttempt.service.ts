import { TaskAttemptModel } from "../models";
import { TaskAttempt } from "../types/database/TaskAttempt.types";

export async function createTaskAttempt(idStudent: number, idTask: number): Promise<TaskAttempt> {
    const taskAttempt = await TaskAttemptModel.create({
        id_student: idStudent,
        id_task: idTask
    });
    return taskAttempt;
}

export async function getStudentCurrTaskAttempt(idStudent: number): Promise<TaskAttempt> {
    const taskAttempt = await TaskAttemptModel.findOne({
        where: { id_student: idStudent, active: true }
    });
    if (!taskAttempt) throw new Error("TaskAttempt not found");
    return taskAttempt;
}
