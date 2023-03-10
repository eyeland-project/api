import { QueryTypes, Transaction } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import { StudentModel } from "../models";
import { Student, TeamMember } from "../types/Student.types";
import { Team } from "../types/Team.types";
import { BlindnessAcuity } from "../types/BlindnessAcuity.types";
import { TaskAttempt } from "../types/TaskAttempt.types";
import { getStudCurrTaskAttempt, updateStudCurrTaskAttempt } from "./taskAttempt.service";
import { Power } from "../types/enums";
import { getAvailablePowers, getMembersFromTeam } from "./team.service";
import { Course } from "../types/Course.types";

export async function getStudentById(id: number): Promise<Student> {
    const student = await StudentModel.findByPk(id);
    if (!student) throw new ApiError(`Student with id ${id} not found`, 404);
    return student;
}

export async function getTeamFromStudent(idStudent: number): Promise<Team> {
    const team = await sequelize.query(`
        SELECT t.* FROM team t
        JOIN task_attempt ta ON ta.id_team = t.id_team
        WHERE ta.id_student = ${idStudent} AND ta.active AND t.active
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as Team[];
    if (!team.length) throw new ApiError("Team not found", 400);
    return team[0];
}

export async function getCourseFromStudent(idStudent: number): Promise<Course> {
    const course = await sequelize.query(`
        SELECT c.* FROM course c
        JOIN student s ON s.id_course = c.id_course
        WHERE s.id_student = ${idStudent}
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as Course[];
    if (!course.length) throw new ApiError("Course not found", 400);
    return course[0];
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

function assignPower(idStudent: number, power: Power, opts: { transaction?: Transaction } = {}){ // prevent errors when updating teammate
    try {
        updateStudCurrTaskAttempt(idStudent, { power });
    } catch (err) { }
};

export async function rafflePower(idStudent: number){
    // * Verify if the student has a visual illness
    const { level } = await getBlindnessAcFromStudent(idStudent);
    // ** if the student has a visual illness, return false
    if (level !== 0) return false;
    // * Get the student team
    const { id_team } = await getTeamFromStudent(idStudent);
    // * Get the available powers
    const powers = await getAvailablePowers(id_team);
    if (powers.length === 0) return false;
    
    // * raffle the powers
    // ** get a number between -1 and the length of the powers array
    const randomIdx = Math.floor(Math.random() * (powers.length + 1)) - 1;
    // ** if the number is -1, return false
    if (randomIdx === -1) return false;
    // ** else, assign the power to the student
    assignPower(idStudent, powers[randomIdx]);
    
    // * return the power
    return powers[randomIdx];
}

export async function assignPowerToStudent(
    idStudent: number,
    power: Power | 'auto',
    teammates: TeamMember[],
    blindnessLevel?: number,
    allowConflicts: boolean = true
): Promise<Power> {
    if (teammates.length > 2) throw new ApiError("Team is full", 400);

    if (!blindnessLevel) blindnessLevel = (await getBlindnessAcFromStudent(idStudent)).level;
    const ids = teammates.map(member => member.id_student);
    const currPowers = teammates.map(member => member.task_attempt.power);
    const currBlindnessLevels = teammates.map(member => member.blindness_acuity.level);

    const getFreePowers = () => {
        return Object.values(Power).filter(power => !currPowers.includes(power));
    };


    if (power === 'auto') {
        let autoPower: Power;
        const randomPowerBetween = (powers: Power[]) => powers[Math.floor(Math.random() * powers.length)];

        if (blindnessLevel !== 0) {
            const withSuperHearingIdx = currPowers.indexOf(Power.SuperHearing);
            if (withSuperHearingIdx === -1) {
                autoPower = Power.SuperHearing;
            } else if (blindnessLevel > currBlindnessLevels[withSuperHearingIdx]) {
                assignPower(ids[withSuperHearingIdx], getFreePowers()[0]); // assign free power to teammate with super_hearing
                autoPower = Power.SuperHearing;
            } else {
                autoPower = randomPowerBetween(getFreePowers()); // assign free power to student
            }
        } else {
            autoPower = randomPowerBetween(getFreePowers());
        }
        assignPower(idStudent, autoPower);
        return autoPower;
    }

    if (power === Power.MemoryPro || power === Power.SuperRadar) {
        assignPower(idStudent, power);
        if (!allowConflicts) {
            const withPowerIdx = currPowers.indexOf(power);
            if (withPowerIdx !== -1) {
                assignPower(ids[withPowerIdx], getFreePowers()[0]); // assign free power to teammate with power
            }
        }
    } else if (power === Power.SuperHearing) {
        const withSuperHearingIdx = currPowers.indexOf(Power.SuperHearing);
        if (withSuperHearingIdx === -1) assignPower(idStudent, power);
        else if (blindnessLevel > currBlindnessLevels[withSuperHearingIdx]) { // there can't be conflict if student has higher blindness level
            assignPower(ids[withSuperHearingIdx], getFreePowers()[0]); // assign free power to teammate with super_hearing
            assignPower(idStudent, power);
        } else if (blindnessLevel === currBlindnessLevels[withSuperHearingIdx]) {
            if (!allowConflicts) {
                assignPower(ids[withSuperHearingIdx], getFreePowers()[0]); // assign free power to teammate with super_hearing
            }
            assignPower(idStudent, power);
        } else throw new ApiError("Student has lower blindness level than teammate with super hearing", 400);
    }
    return power;
}

export async function getTeammates(idStudent: number, teamInfo?: { idTeam?: number, code?: string }): Promise<TeamMember[]> {
    if (!teamInfo) {
        const { id_team: idTeam } = await getTeamFromStudent(idStudent);
        teamInfo = { idTeam };
    }
    return (await getMembersFromTeam(teamInfo)).filter(({ id_student }) => id_student !== idStudent);
}
