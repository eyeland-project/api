import { ApiError } from "../middlewares/handleErrors";
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
    if (!taskAttempt) throw new ApiError("TaskAttempt not found", 404);
    return taskAttempt;
}

export async function updateStudentCurrTaskAttempt(idStudent: number, values: any) {
    if (!Object.keys(values).length) throw new ApiError("No values to update TaskAttempt", 400);

    const result = await TaskAttemptModel.update(
        values,
        { where: { id_student: idStudent, active: true } }
    );
    if (!result[0]) throw new ApiError("Task Attempt not found", 404);
}

export async function finishStudentPrevTaskAttempts(idStudent: number) {
    await TaskAttemptModel.update(
        { active: false, id_team: null },
        { where: { id_student: idStudent, active: true } }
    );
}
