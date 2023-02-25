import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TeamModel } from "../models";
import { Team } from "../types/Team.types";
import { createTaskAttempt, updateStudCurrTaskAttempt } from "./taskAttempt.service";
import { getTaskByOrder } from "./task.service";
import { ApiError } from "../middlewares/handleErrors";
import { Student, TeamMember } from "../types/Student.types";
import { Power } from "../types/enums";
import { Namespace, of } from "../listeners/sockets";

export async function getTeamByCode(code: string): Promise<Team> {
    const team = await TeamModel.findOne({ where: { code } });
    if (!team) throw new ApiError('Team not found', 404);
    return team;
}

export async function getMembersFromTeam(teamInfo: { idTeam?: number, code?: string }): Promise<TeamMember[]> {
    const { idTeam, code } = teamInfo;
    if (!idTeam && !code) throw new ApiError('Must provide either idTeam or code', 400);
    
    interface TeamMemberRaw extends Student {
        blindness_acuity_name: string;
        blindness_acuity_level: number;
        id_task_attempt: number;
        power: Power | null;
    };
    const teamMembers = await sequelize.query<TeamMemberRaw>(`
        SELECT s.*, ba.name AS blindness_acuity_name, ba.level AS blindness_acuity_level, ta.id_task_attempt, ta.power
        FROM student s
        JOIN task_attempt ta ON ta.id_student = s.id_student
        JOIN team t ON t.id_team = ta.id_team
        JOIN blindness_acuity ba ON ba.id_blindness_acuity = s.id_blindness_acuity
        WHERE ${idTeam ? `t.id_team = ${idTeam}` : `t.code = '${code}'`}
    `, { type: QueryTypes.SELECT });
    return teamMembers.map(({ blindness_acuity_level, blindness_acuity_name, id_task_attempt, power, ...studentFields }) => ({
        ...studentFields,
        blindness_acuity: {
            level: blindness_acuity_level,
            name: blindness_acuity_name
        },
        task_attempt: {
            id: id_task_attempt,
            power
        }
    }));
}

export async function getTeamById(idTeam: number): Promise<Team> {
    const team = await TeamModel.findOne({ where: { id_team: idTeam } });
    if (!team) throw new ApiError("Team not found", 404);
    return team;
}

export async function createTeam(name: string, idCourse: number): Promise<Team> {
    return await TeamModel.create({ name, id_course: idCourse }); // code is auto-generated; TODO: create again if code already exists?
}

export async function updateTeam(idTeam: number, fields: Partial<Team>) {
    if (fields.active === true) throw new ApiError('Cannot re-activate team', 400);
    await TeamModel.update(fields, { where: { id_team: idTeam } });
}

export async function addStudentToTeam(idStudent: number, idTeam: number, taskOrder: number) {
    try {
        await updateStudCurrTaskAttempt(idStudent, { id_team: idTeam });
    } catch (err) {
        console.log('Student has no task attempt, creating one...');
        const { id_task } = await getTaskByOrder(taskOrder);
        await createTaskAttempt(idStudent, id_task, idTeam);
        console.log('Task attempt created');
    }
}

export async function removeStudFromTeam(idStudent: number) {
    await updateStudCurrTaskAttempt(idStudent, { id_team: null });
}

export async function notifyStudLeftTeam(idStudent: number, idTeam: number) {
    const nsp = of(Namespace.STUDENTS);
    if (!nsp) throw new ApiError("Namespace not found", 500);

    nsp.to('t' + idTeam).emit('session:student:left', idStudent);
}

export async function notifyStudJoinedTeam(student: Student, power: Power | null, idTeam: number) {
    const nsp = of(Namespace.STUDENTS);
    if (!nsp) throw new ApiError("Namespace not found", 500);

    const { id_student, first_name, last_name, username } = student;
    nsp.to('t' + idTeam).emit('session:student:joined', {
        id: id_student,
        first_name,
        last_name,
        username,
        power
    });
}
