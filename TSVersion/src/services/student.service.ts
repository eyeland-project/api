import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import { StudentModel } from "../models";
import { Student, TeamMember } from "../types/Student.types";
import { Team } from "../types/Team.types";
import { BlindnessAcuity } from "../types/BlindnessAcuity.types";
import { TaskAttempt } from "../types/TaskAttempt.types";
import { updateStudCurrTaskAttempt } from "./taskAttempt.service";
import { Power } from "../types/enums";

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

export async function assignPowerToStudent(idStudent: number, power: Power | 'auto', teammates: TeamMember[]) {
    if (teammates.length > 2) throw new ApiError("Team is full", 400);

    const { level: blindnessLevel } = await getBlindnessAcFromStudent(idStudent);
    const ids = teammates.map(member => member.id_student);
    const currPowers = teammates.map(member => member.task_attempt.power);
    const currBlindnessLevels = teammates.map(member => member.blindness_acuity.level);

    const getFreePowers = () => {
        const powers: Power[] = [Power.MemoryPro, Power.SuperRadar, Power.SuperHearing];
        return powers.filter(power => !currPowers.includes(power));
        // return [Power.memory_pro, Power.super_radar, Power.super_hearing].filter(power => !currPowers.includes(power));
    };
    const updateStudentCurrTaskAttemptTC = (idStudent: number, values: Partial<TaskAttempt>) => { // prevent errors when updating teammate
        try {
            updateStudCurrTaskAttempt(idStudent, values);
        } catch (err) {}
    }

    if (power === Power.MemoryPro || power === Power.SuperRadar) {
        updateStudentCurrTaskAttemptTC(idStudent, { power });
        if (currPowers.includes(power)) {
            updateStudentCurrTaskAttemptTC(ids[currPowers.indexOf(power)], { power: getFreePowers()[0] }); // assign free power to teammate with power
        }
    } else if (power === Power.SuperHearing) {
        const withSuperHearingIdx = currPowers.indexOf(Power.SuperHearing);
        if (withSuperHearingIdx === -1) updateStudentCurrTaskAttemptTC(idStudent, { power });
        else {
            if (blindnessLevel >= currBlindnessLevels[withSuperHearingIdx]) {
                updateStudentCurrTaskAttemptTC(ids[withSuperHearingIdx], { power: getFreePowers()[0] }); // assign free power to teammate with super_hearing
                updateStudentCurrTaskAttemptTC(idStudent, { power });
            } else throw new ApiError("Super-hearing blocked", 400);
        }
    } else if (power === 'auto') {
        const randomPowerBetween = (powers: Power[]) => powers[Math.floor(Math.random() * powers.length)];
        if (blindnessLevel !== 0) {
            const withSuperHearingIdx = currPowers.indexOf(Power.SuperHearing);
            if (withSuperHearingIdx === -1) updateStudentCurrTaskAttemptTC(idStudent, { power: Power.SuperHearing });
            else {
                if (blindnessLevel > currBlindnessLevels[withSuperHearingIdx]) {
                    updateStudentCurrTaskAttemptTC(ids[withSuperHearingIdx], { power: getFreePowers()[0] }); // assign free power to teammate with super_hearing
                    updateStudentCurrTaskAttemptTC(idStudent, { power: Power.SuperHearing });
                } else {
                    updateStudentCurrTaskAttemptTC(idStudent, { power: randomPowerBetween(getFreePowers()) }); // assign free power to student
                }
            }
        } else {
            updateStudentCurrTaskAttemptTC(idStudent, { power: randomPowerBetween(getFreePowers()) });
        }
    }
}
