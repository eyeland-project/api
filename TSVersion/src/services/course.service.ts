import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import { CourseModel, TeamModel } from "../models";
import { Course } from "../types/Course.types";
import { Team } from "../types/Team.types";
import { Namespace, of } from "../listeners/sockets";
import { OutgoingEvents, Power } from "../types/enums";
import { groupBy } from "../utils";
import { TeamResp } from "../types/responses/globals.types";

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

export async function getTeamsFromCourseWithStud(idCourse: number, active: boolean): Promise<TeamResp[]> {
    type StudentWithTeam = {
        id_team: number;
        code: string;
        name: string;
        active: boolean;
        id_student: number;
        username: string;
        first_name: string;
        last_name: string;
        power: Power;
    }

    const studentsWithTeam = await sequelize.query<StudentWithTeam>(`
        SELECT t.id_team, t.code, t.name, t.active, s.id_student, s.username, s.first_name, s.last_name, ta.power
        FROM team t
        LEFT JOIN task_attempt ta ON ta.id_team = t.id_team AND ta.active = ${active}
        LEFT JOIN student s ON s.id_student = ta.id_student
        WHERE t.id_course = ${idCourse} AND t.active = ${active};
    `, { type: QueryTypes.SELECT });

    // console.log(studentsWithTeam);

    const teams = groupBy(studentsWithTeam, 'id_team') as StudentWithTeam[][];
    // console.log(teams);
    return teams.map((students) => {
        const { active, code, id_team, name } = students[0];
        return {
            id: id_team,
            code: code,
            name: name,
            active: active,
            students: students
            .filter(({id_student})=>{
                return id_student !== null;
            })
            .map(({ id_student, username, first_name, last_name, power }) => ({
                id: id_student,
                username,
                firstName: first_name,
                lastName: last_name,
                power
            }))
        };
    });
}

export async function createCourseSession(idCourse: number) {
    const nsp = of(Namespace.STUDENTS);
    if (!nsp) throw new ApiError("Namespace not found", 500);

    const { session, id_course } = await getCourseById(idCourse);
    if (session) throw new ApiError("Course already has an active session", 400);

    await updateCourse(idCourse, { session: true });
    nsp.to('c' + id_course).emit(OutgoingEvents.SESSION_CREATE);
}

export async function endCourseSession(idCourse: number) {
    const nsp = of(Namespace.STUDENTS);
    if (!nsp) throw new ApiError("Namespace not found", 500);

    const { session, id_course } = await getCourseById(idCourse);
    if (!session) throw new ApiError("Course has no active session", 400);

    await updateCourse(idCourse, { session: false });
    nsp.to('c' + id_course).emit(OutgoingEvents.SESSION_END);
}

export async function startCourseSession(idCourse: number) {
    const nsp = of(Namespace.STUDENTS);
    if (!nsp) throw new ApiError("Namespace not found", 500);

    const { session, id_course } = await getCourseById(idCourse);
    if (!session) throw new ApiError("Course has no active session", 400);

    nsp.to('c' + id_course).emit(OutgoingEvents.SESSION_START);
}
