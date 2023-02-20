import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import { StudentModel } from "../models";
import { Student } from "../types/database/Student.types";
import { createTaskAttempt, getStudentCurrTaskAttempt, updateStudentCurrTaskAttempt } from "./taskAttempt.service";
import { getTeamByCode, getTeamFromStudent } from "./team.service";
import { getTaskByOrder } from "./task.service";

export async function getStudentById(id: number): Promise<Student> {
    const student = await StudentModel.findByPk(id);
    if (!student) throw new ApiError(`Student with id ${id} not found`, 404);
    return student;
}

export async function hasTeam(idStudent: number): Promise<boolean> {
    return (await getStudentCurrTaskAttempt(idStudent)).id_team !== null;
}

export async function joinTeam(idStudent: number, code: string, taskOrder: number) {
    const { id_course: studentCourse } = await getStudentById(idStudent);
    const { id_team, active: teamActive, id_course: teamCourse } = await getTeamByCode(code);

    if (studentCourse !== teamCourse) throw new ApiError('Student and team are not in the same course', 400);
    if (!teamActive) throw new ApiError('Team is not active', 400);
    
    let prevTeam;
    try {
        prevTeam = await getTeamFromStudent(idStudent);
    } catch (err) {} // no team found for student (expected)
    if (prevTeam) {
        console.log('Student has a team, leaving it...');
        await leaveTeam(idStudent);
        console.log('Student left previous team');
    }

    if ((await getStudentsFromTeam(id_team)).length >= 3) throw new ApiError('Team is full', 400);
    
    try {
        await updateStudentCurrTaskAttempt(idStudent, { id_team });
    } catch (err) {
        console.log('Student has no task attempt, creating one...');
        const { id_task } = await getTaskByOrder(taskOrder);
        await createTaskAttempt(idStudent, id_task, id_team);
        console.log('Task attempt created');
    }
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
