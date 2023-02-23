import { QueryTypes, Transaction } from "sequelize";
import { ApiError } from "../middlewares/handleErrors";
import { TaskAttemptModel } from "../models";
import { TaskAttempt } from "../types/TaskAttempt.types";
import sequelize from "../database/db";

export async function getStudCurrTaskAttempt(idStudent: number): Promise<TaskAttempt> {
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

export async function updateStudCurrTaskAttempt(idStudent: number, values: Partial<TaskAttempt>, opts: { transaction?: Transaction } = {}) {
    if (!Object.keys(values).length) throw new ApiError("No values to update TaskAttempt", 400);
    const result = await TaskAttemptModel.update(
        values,
        { where: { id_student: idStudent, active: true }, ...opts }
    );
    if (!result[0]) throw new ApiError("Task Attempt not found", 404);
}

export async function finishStudTaskAttempts(idStudent: number) {
    await TaskAttemptModel.update(
        { active: false },
        { where: { id_student: idStudent, active: true } }
    );
}
