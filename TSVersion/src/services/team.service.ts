import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TeamModel } from "../models";
import { Team } from "../types/database/Team.types";
import { createTaskAttempt, updateStudentCurrTaskAttempt } from "./taskAttempt.service";
import { getTaskByOrder } from "./task.service";
import { ApiError } from "../middlewares/handleErrors";
import { assignPowerToStudent, getBlindnessAcFromStudent, getStudentById, getTeamFromStudent } from "./student.service";
import { Student, TeamMember } from "../types/database/Student.types";
import { Power } from "../types/database/TaskAttempt.types";

export async function getTeamByCode(code: string): Promise<Team> {
    const team = await TeamModel.findOne({ where: { code } });
    if (!team) throw new ApiError('Team not found', 404);
    return team;
}

export async function getTeamMembers(code: string): Promise<TeamMember[]> {
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
        WHERE t.code = '${code}'
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

export async function getTeamsFromCourse(idCourse: number): Promise<Team[]> {
    return await TeamModel.findAll({ where: { id_course: idCourse } });
}

export async function addStudentToTeam(idStudent: number, code: string, taskOrder: number) {
    const { id_course: studentCourse } = await getStudentById(idStudent);
    const { id_team, active: teamActive, id_course: teamCourse } = await getTeamByCode(code);

    if (studentCourse !== teamCourse) throw new ApiError('Student and team are not in the same course', 400);
    if (!teamActive) throw new ApiError('Team is not active', 400);

    let codePrevTeam;
    try {
        codePrevTeam = (await getTeamFromStudent(idStudent)).code;
    } catch (err) { }
    if (code === codePrevTeam) throw new ApiError('Student is already in this team', 400);

    const teammates = await getTeamMembers(code);
    if (teammates.length >= 3) throw new ApiError('Team is full', 400);

    try {
        await updateStudentCurrTaskAttempt(idStudent, { id_team });
    } catch (err) {
        console.log(err);

        console.log('Student has no task attempt, creating one...');
        const { id_task } = await getTaskByOrder(taskOrder);
        await createTaskAttempt(idStudent, id_task, id_team);
        console.log('Task attempt created');
    }
    assignPowerToStudent(idStudent, 'auto', teammates);
}

export async function removeStudentFromTeam(idStudent: number) {
    await updateStudentCurrTaskAttempt(idStudent, { id_team: null });
}
