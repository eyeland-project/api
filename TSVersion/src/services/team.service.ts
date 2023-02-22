import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TeamModel } from "../models";
import { Team } from "../types/database/Team.types";
import { createTaskAttempt, updateStudentCurrTaskAttempt } from "./taskAttempt.service";
import { getTaskByOrder } from "./task.service";
import { ApiError } from "../middlewares/handleErrors";
import { getStudentById } from "./student.service";
import { Student, TeamMember } from "../types/database/Student.types";
import { BlindnessAcuity } from "../types/database/BlindnessAcuity.types";
import { Power } from "../types/database/TaskAttempt.types";
import { TeamMemberSocket } from "../types/responses/students.types";

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
}

export async function removeStudentFromTeam(idStudent: number) {
    await updateStudentCurrTaskAttempt(idStudent, { id_team: null });
}

export async function assignPowersAuto(code: string)/*: Promise<TeamMemberSocket[]> */ {
    const memoryProOrSuperRadar = () => Math.random() < 0.5 ? 'memory_pro' : 'super_radar';

    const teamMembers = await getTeamMembers(code);
    if (teamMembers.length === 1) {
        
        // const currPower = teamMembers[0].task_attempt.power;
        // if (teamMembers[0].blindness_acuity.level === 0) { // no blindness
        //     if (!currPower || currPower === 'super_hearing') { // no power or super hearing
        //         updateStudentCurrTaskAttempt(teamMembers[0].id_student, { power: memoryProOrSuperRadar() });
        //     }
        // } else { // has some blindness level
        //     if (currPower !== 'super_hearing') { // no super hearing
        //         updateStudentCurrTaskAttempt(teamMembers[0].id_student, { power: 'super_hearing' });
        //     }
        // }
    } else {
        const currPowers = teamMembers.map(member => member.task_attempt.power);
        const ids = teamMembers.map(member => member.id_student);
        const blindnessLevels = teamMembers.map(member => member.blindness_acuity.level);
        const maxBlindnessLevel = Math.max(...blindnessLevels);
    
        if (teamMembers.length === 2) {
            // version 1
            // const firstWithSuperHearingIdx = currPowers.indexOf('super_hearing');
            // if (firstWithSuperHearingIdx !== -1) { // super hearing is already assigned
            //     const notFirstWithSuperHearingIdx = (firstWithSuperHearingIdx + 1) % 2;
    
            //     if (maxBlindnessLevel > 0) { // some member has some blindness level
            //         const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
            //         if (withMaxBlindnessIdx !== firstWithSuperHearingIdx) { // the member with max blindness is not the one with super hearing
            //             updateStudentCurrTaskAttempt(ids[firstWithSuperHearingIdx], { power: memoryProOrSuperRadar() });
            //             if (currPowers[withMaxBlindnessIdx] !== 'super_hearing') { // the member with max blindness doesn't have super hearing
            //                 updateStudentCurrTaskAttempt(ids[withMaxBlindnessIdx], { power: 'super_hearing' });
            //             }
            //         } else {
            //             if (!currPowers[notFirstWithSuperHearingIdx] || currPowers[notFirstWithSuperHearingIdx] === 'super_hearing') { // the other member has no power or has super hearing too
            //                 updateStudentCurrTaskAttempt(ids[notFirstWithSuperHearingIdx], { power: memoryProOrSuperRadar() });
            //             }
            //         }
            //     } else { // no member has blindness
            //         const power1 = memoryProOrSuperRadar();
            //         const power2 = power1 === 'memory_pro' ? 'super_radar' : 'memory_pro';
            //         updateStudentCurrTaskAttempt(ids[firstWithSuperHearingIdx], { power: power1 });
            //         if (currPowers[notFirstWithSuperHearingIdx] !== power2) { // the other member has super_hearing or null
            //             updateStudentCurrTaskAttempt(ids[notFirstWithSuperHearingIdx], { power: power2 });
            //         }
            //     }
            // } else { // no member has super hearing
            //     if (maxBlindnessLevel > 0) { // some member has some blindness level
            //         const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
            //         updateStudentCurrTaskAttempt(ids[withMaxBlindnessIdx], { power: 'super_hearing' });
            //         const notWithMaxBlindnessIdx = (withMaxBlindnessIdx + 1) % 2;
            //         if (!currPowers[notWithMaxBlindnessIdx]) { // the other member has no power
            //             updateStudentCurrTaskAttempt(ids[notWithMaxBlindnessIdx], { power: memoryProOrSuperRadar() });
            //         }
            //     } else { // no member has blindness
            //         const power1 = memoryProOrSuperRadar();
            //         const power2 = power1 === 'memory_pro' ? 'super_radar' : 'memory_pro';
            //         if (!currPowers[0]) { // member 1 has no power
            //             updateStudentCurrTaskAttempt(ids[0], { power: power1 });
            //         }
            //         if (!currPowers[1]) { // member 2 has no power
            //             updateStudentCurrTaskAttempt(ids[1], { power: power2 });
            //         }
            //     }
            // }
    
            // version 2

            
    
        } else if (teamMembers.length === 3) {
            // const maxBlindnessLevel = Math.max(...blindnessLevels);
            // if (maxBlindnessLevel > 0) { // some member has some blindness level
            //     const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
            //     if (currPowers[withMaxBlindnessIdx] !== 'super_hearing') { // the member with max blindness doesn't have super hearing
            //         updateStudentCurrTaskAttempt(ids[withMaxBlindnessIdx], { power: 'super_hearing' });
            //     }
            // }
    
        }
    }
}
