import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import { CourseModel, TeamModel } from "../models";
import { Course } from "../types/Course.types";
import { Team } from "../types/Team.types";
import { TeamSummResp } from "../types/responses/teachers.types";
import { of } from "../listeners/sockets";
import { Namespace } from "../listeners/state";

// COURSE CRUD
// get many
export async function getCourses(): Promise<Course[]> {
    return await CourseModel.findAll();
}

// get one
export async function getCourseById(idCourse: number): Promise<Course> {
    const course = await CourseModel.findOne({ where: { id_course: idCourse } });
    if (!course) throw new ApiError("Course not found", 404);
    return course;
}

export async function createCourse(name: string, description: string, idTeacher: number, idInstitution: number): Promise<Course> {
    return await CourseModel.create({ name, description, id_teacher: idTeacher, id_institution: idInstitution });
}

export async function updateCourse(idCourse: number, fields: Partial<Course>) {
    const result = await CourseModel.update(fields, { where: { id_course: idCourse } });
    if (!result[0]) throw new ApiError("Course not found", 404);
}

export async function deleteCourse(idCourse: number) {
    const result = await CourseModel.destroy({ where: { id_course: idCourse } });
    if (!result) throw new ApiError("Course not found", 404);
}

export async function getTeamsFromCourse(idCourse: number): Promise<Team[]> {
    return await TeamModel.findAll({ where: { id_course: idCourse } });
}

export async function getTeamsFromCourseWithNumStud(idCourse: number, active: boolean): Promise<TeamSummResp[]> {
    const teams = await sequelize.query<TeamSummResp>(`
        SELECT t.*, COUNT(s.id_student) AS "numStudents"
        FROM team t
        JOIN task_attempt ta ON ta.id_team = t.id_team
        JOIN student s ON s.id_student = ta.id_student
        WHERE t.id_course = ${idCourse} AND t.active = ${active}
        GROUP BY t.id_team
    `, { type: QueryTypes.SELECT });
    console.log(teams);
    return teams;
}

export async function createCourseSession(idCourse: number) {
    const { session } = await getCourseById(idCourse);
    if (session) throw new ApiError("Course already has an active session", 400);
    await updateCourse(idCourse, { session: true });
    
    const nsp = of(Namespace.STUDENTS);
    if (!nsp) throw new ApiError("Namespace not found", 500);
    nsp.emit('session:teacher:create');
}

export async function endCourseSession(idCourse: number) {
    const { session } = await getCourseById(idCourse);
    if (!session) throw new ApiError("Course has no active session", 400);
    await updateCourse(idCourse, { session: false });
    
    const nsp = of(Namespace.STUDENTS);
    if (!nsp) throw new ApiError("Namespace not found", 500);
    nsp.emit('session:teacher:end');
}

export async function startCourseSession(idCourse: number) {
    const { session } = await getCourseById(idCourse);
    if (!session) throw new ApiError("Course has no active session", 400);
    
    const nsp = of(Namespace.STUDENTS);
    if (!nsp) throw new ApiError("Namespace not found", 500);
    nsp.emit('session:teacher:start');
}
