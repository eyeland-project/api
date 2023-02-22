import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import { StudentModel } from "../models";
import { Student } from "../types/database/Student.types";
import { Team } from "../types/database/Team.types";
import { BlindnessAcuity } from "../types/database/BlindnessAcuity.types";

export async function getStudentById(id: number): Promise<Student> {
    const student = await StudentModel.findByPk(id);
    if (!student) throw new ApiError(`Student with id ${id} not found`, 404);
    return student;
}

export async function getTeamFromStudent(idStudent: number): Promise<Team> {
    const team = await sequelize.query(`
        SELECT t.* FROM team t
        JOIN task_attempt ta ON ta.id_team = t.id_team
        WHERE ta.id_student = ${idStudent} AND ta.active = TRUE AND t.active = TRUE
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as Team[];
    if (!team.length) throw new ApiError("Team not found", 400);
    return team[0];
}

export async function getBlindnessAcFromStudent(idStudent: number): Promise<BlindnessAcuity> {
    const blindness = await sequelize.query<BlindnessAcuity>(`
        SELECT ba.* FROM blindness_acuity ba
        JOIN student s ON s.id_blindness_acuity = ba.id_blindness_acuity
        WHERE s.id_student = ${idStudent};
    `, { type: QueryTypes.SELECT });
    if (!blindness.length) throw new ApiError("Blindness not found", 400);
    return blindness[0];
}
