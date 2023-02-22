import { ApiError } from "../middlewares/handleErrors";
import { TaskAttemptModel } from "../models";
import { Task } from "../types/database/Task.types";
import { Power, TaskAttempt } from "../types/database/TaskAttempt.types";

export async function getStudentCurrTaskAttempt(idStudent: number): Promise<TaskAttempt> {
    const taskAttempt = await TaskAttemptModel.findOne({
        where: { id_student: idStudent, active: true }
    });
    if (!taskAttempt) throw new ApiError("TaskAttempt not found", 404);
    return taskAttempt;
}

export async function createTaskAttempt(idStudent: number, idTask: number, idTeam: number | null): Promise<TaskAttempt> {
    const taskAttempt = await TaskAttemptModel.create({
        id_student: idStudent,
        id_task: idTask,
        id_team: idTeam
    });
    return taskAttempt;
}

export async function updateStudentCurrTaskAttempt(idStudent: number, values: Partial<TaskAttempt>) {
    if (!Object.keys(values).length) throw new ApiError("No values to update TaskAttempt", 400);

    const result = await TaskAttemptModel.update(
        values,
        { where: { id_student: idStudent, active: true } }
    );
    if (!result[0]) throw new ApiError("Task Attempt not found", 404);
}

export async function finishStudentPrevTaskAttempts(idStudent: number) {
    await TaskAttemptModel.update(
        { active: false },
        { where: { id_student: idStudent, active: true } }
    );
}
