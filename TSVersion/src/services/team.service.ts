import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { StudentModel, TeamModel } from "../models";
import { getStudentById } from "./student.service";
import { updateStudentCurrTaskAttempt } from "./taskAttempt.service";
import { Team } from "../types/database/Team.types";
import { Student } from "../types/database/Student.types";
import { ApiError } from "../middlewares/handleErrors";

export async function getTeamByCode(code: string): Promise<Team> {
    const team = await TeamModel.findOne({ where: { code } });
    if (!team) throw new ApiError('Team not found', 404);
    return team;
}

export async function joinTeam(idStudent: number, code: string) {
    const { id_course: studentCourse } = await getStudentById(idStudent);
    const { id_team, active: teamActive, id_course: teamCourse } = await getTeamByCode(code);

    if (studentCourse !== teamCourse) throw new ApiError('Student and team are not in the same course', 400);
    if (!teamActive) throw new ApiError('Team is not active', 400);
    
    let prevTeam;
    try {
        prevTeam = await getTeamFromStudent(idStudent);
    } catch (err) {} // no team found for student (expected)
    if (prevTeam) throw new ApiError('Student already has a team', 400); // TODO: allow students to leave their team

    if ((await getStudentsFromTeam(id_team)).length >= 3) throw new ApiError('Team is full', 400);
    
    // const taskAttempt = await getStudentCurrTaskAttempt(idStudent);
    // await taskAttempt.update({ id_team });
    await updateStudentCurrTaskAttempt(idStudent, { id_team });
}


export async function leaveTeam(idStudent: number) {
    await getTeamFromStudent(idStudent); // check if student has a team
    await updateStudentCurrTaskAttempt(idStudent, { id_team: null });
}

export async function getStudentsFromTeam(idTeam: number): Promise<Student[]> {
    const students = await sequelize.query(`
        SELECT s.* FROM student s
        JOIN task_attempt ta ON ta.id_student = s.id_student
        JOIN team t ON t.id_team = ta.id_team
        WHERE t.id_team = ${idTeam};
    `, { type: QueryTypes.SELECT }) as Student[];
    console.log(students);
    return students;
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
