import { TaskAttemptModel } from "../models";

export async function createTaskAttempt(idStudent: number, idTask: number): Promise<boolean> {
    await TaskAttemptModel.create({
        id_student: idStudent,
        id_task: idTask
    });
    return true;
}
