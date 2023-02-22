import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TeamModel } from "../models";
import { Team } from "../types/database/Team.types";
import { createTaskAttempt, updateStudentCurrTaskAttempt } from "./taskAttempt.service";
import { getTaskByOrder } from "./task.service";
import { ApiError } from "../middlewares/handleErrors";
import { assignPowerToStudent, getStudentById } from "./student.service";
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

    const teammates = await getTeamMembers(code);
    if (teammates.length >= 3) throw new ApiError('Team is full', 400);

    try {
        await updateStudentCurrTaskAttempt(idStudent, { id_team });
    } catch (err) {
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

// export async function assignPowersAuto(code: string)/*: Promise<TeamMemberSocket[]> */ {
//     const randomPowerBetween = (...powers: Power[]) => powers[Math.floor(Math.random() * powers.length)];

//     const teamMembers = await getTeamMembers(code);

//     const currPowers = teamMembers.map(member => member.task_attempt.power);
//     const ids = teamMembers.map(member => member.id_student);
//     const blindnessLevels = teamMembers.map(member => member.blindness_acuity.level);

//     const maxBlindnessLevel = Math.max(...blindnessLevels);

//     if (teamMembers.length === 1) { // If there is only one member in the team
//         if (blindnessLevels[0] !== 0) { // If has blindness
//             if (currPowers[0] !== 'super_hearing') { // If has not super_hearing power
//                 updateStudentCurrTaskAttempt(ids[0], { power: 'super_hearing' });
//             }
//         } else { // If has no blindness
//             if (!currPowers[0]) { // If has not any power
//                 updateStudentCurrTaskAttempt(ids[0], { power: randomPowerBetween('super_hearing', 'memory_pro', 'super_radar') });
//             }
//         }
//     } else if (teamMembers.length === 2) { // If there are two members in the team
//         if (maxBlindnessLevel > 0) { // If there is one member with blindness
//             const blindestIdx = blindnessLevels.indexOf(maxBlindnessLevel);
//             if (currPowers[blindestIdx] !== 'super_hearing') { // If the blindest member has not super_hearing power
//                 if (currPowers.at(blindestIdx - 1) === 'super_hearing') { // if the other member has super_hearing power
//                     await updateStudentCurrTaskAttempt( // await because the other member has to be updated before the blindest member
//                         ids.at(blindestIdx - 1) as number,
//                         { power: randomPowerBetween('memory_pro', 'super_radar') }
//                     );
//                 } else if (!currPowers.at(blindestIdx - 1)) { // if the other member has no power
//                     updateStudentCurrTaskAttempt(
//                         ids.at(blindestIdx - 1) as number,
//                         { power: randomPowerBetween('memory_pro', 'super_radar') }
//                     );
//                 }
//                 updateStudentCurrTaskAttempt(ids[blindestIdx], { power: 'super_hearing' });
//             } else if (!currPowers.at(blindestIdx - 1)) { // if the blindest member has super_hearing power and the other member has no power
//                 updateStudentCurrTaskAttempt(
//                     (ids.at(blindestIdx - 1) as number),
//                     { power: randomPowerBetween('super_radar', 'memory_pro') }
//                 );
//             }
//         } else { // If there are no members with blindness
//             if (!currPowers[0] && !currPowers[1]) {
//                 const powers: Power[] = ['super_hearing', 'memory_pro', 'super_radar'];
//                 const power1 = randomPowerBetween(...powers);
//                 const power2 = randomPowerBetween(...powers.filter(power => power !== power1));
//                 updateStudentCurrTaskAttempt(ids[0], { power: power1 });
//                 updateStudentCurrTaskAttempt(ids[1], { power: power2 });
//             } else if (!currPowers[0]) {
//                 const powers: Power[] = ['super_hearing', 'memory_pro', 'super_radar'];
//                 const power = randomPowerBetween(...powers.filter(power => power !== currPowers[1]));
//                 updateStudentCurrTaskAttempt(ids[0], { power: power });
//             } else if (!currPowers[1]) {
//                 const powers: Power[] = ['super_hearing', 'memory_pro', 'super_radar'];
//                 const power = randomPowerBetween(...powers.filter(power => power !== currPowers[0]));
//                 updateStudentCurrTaskAttempt(ids[1], { power: power });
//             }
//         }
//     } else if (teamMembers.length === 3) {
//     }
// }
