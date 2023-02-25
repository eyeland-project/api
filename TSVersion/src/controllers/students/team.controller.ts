import { Request, Response } from 'express';
import { assignPowerToStudent, getBlindnessAcFromStudent, getStudentById, getTeamFromStudent, getTeammates } from '../../services/student.service';
import { addStudentToTeam, getMembersFromTeam, getTeamByCode, removeStudFromTeam, notifyStudLeftTeam, notifyStudJoinedTeam } from '../../services/team.service';
import { ApiError } from '../../middlewares/handleErrors';
import { LoginTeamReq } from '../../types/requests/students.types';
import { getTeamsFromCourse } from '../../services/course.service';
import { TeamResp } from '../../types/responses/students.types';
import { getStudCurrTaskAttempt } from '../../services/taskAttempt.service';
import { Power } from '../../types/enums';
import { PowerReq } from "../../types/requests/students.types";

export async function getTeams(req: Request, res: Response<TeamResp[]>, next: Function) {
    try {
        const { id: idUser } = req.user!;
        const { id_course } = await getStudentById(idUser);
        const teams = await getTeamsFromCourse(id_course);
        res.status(200).json([]);
        // res.status(200).json(teams.filter(t => t.active).map(({ name, code, id_team: id }) => ({
        //     id,
        //     name,
        //     code: code || '',
        // })));
    } catch (err) {
        next(err);
    }
}

export async function joinTeam(req: Request<LoginTeamReq>, res: Response, next: Function) {
    const { id: idStudent } = req.user!;
    const { code, taskOrder } = req.body as LoginTeamReq;

    if (!code || !taskOrder) return next(new ApiError('Missing code or taskOrder', 400));
    let prevTeam;
    try {
        prevTeam = await getTeamFromStudent(idStudent); // check if student is already in a team
    } catch (err) { } // no team found for student (expected)

    try {
        const { id_team: idTeam, active: teamActive, id_course: teamCourse } = await getTeamByCode(code);
        if (idTeam === prevTeam?.id_team) throw new ApiError('Student is already in this team', 400);

        const student = await getStudentById(idStudent);
        if (student.id_course !== teamCourse) throw new ApiError('Student and team are not in the same course', 400);
        if (!teamActive) throw new ApiError('Team is not active', 400);

        const teammates = await getMembersFromTeam({ idTeam });
        if (teammates.length >= 3) throw new ApiError('Team is full', 400);

        await addStudentToTeam(idStudent, idTeam, taskOrder);
        res.status(200).json({ message: 'Done' });

        try {
            getBlindnessAcFromStudent(idStudent).then(async ({ level }) => {
                const power = level !== 0
                    ? await assignPowerToStudent(idStudent, "auto", teammates, level, false)  // only allow conflicts if student requests for a power
                    : null;
                // 
                notifyStudJoinedTeam(student, power, idTeam).catch(err => console.log(err));
            }).catch(err => console.log(err));

            if (prevTeam) { // notify previous team that student left
                notifyStudLeftTeam(idStudent, prevTeam.id_team).catch(err => console.log(err));
            }
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        next(err);
    }
}

export async function leaveTeam(req: Request, res: Response, next: Function) {
    const { id: idStudent } = req.user!;

    let idTeam;
    try {
        idTeam = (await getTeamFromStudent(idStudent)).id_team; // check if student is already in a team
    } catch (err) { }

    try {
        await removeStudFromTeam(idStudent);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }

    if (!idTeam) return;
    try {
        // check if this student had super_hearing to assign it to another student
        const { power } = await getStudCurrTaskAttempt(idStudent);
        if (power !== Power.SuperHearing) return; // student doesn't have super_hearing

        const teammates = await getTeammates(idStudent);
        if (!teammates.length) return; // no teammates left

        const blindnessLevels = teammates.map(({ blindness_acuity: { level } }) => level);
        const maxBlindnessLevel = Math.max(...blindnessLevels);
        if (maxBlindnessLevel === 0) return; // no teammates with blindness

        const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
        const { id_student: idNewStudent } = teammates[withMaxBlindnessIdx];
        assignPowerToStudent(idNewStudent, Power.SuperHearing, teammates);
    } catch (err) {
        console.log(err);
    }
}

export async function reqPower(req: Request, res: Response, next: Function) {
    const { power } = req.body as PowerReq;
    const { id: idStudent } = req.user!;
    try {
        const teammates = await getTeammates(idStudent);
        await assignPowerToStudent(idStudent, power, teammates);
        res.status(200).json({ message: 'Power assigned successfully' });
    } catch (err) {
        next(err);
    }
}

export async function ready(req: Request, res: Response, next: Function) {
    const { id: idStudent } = req.user!;
    try {
        const { power } = await getStudCurrTaskAttempt(idStudent);
        if (!power) return res.status(400).json({ message: 'You don\'t have any power' });
        res.status(200).json({ message: 'Ok' });
    } catch (err) {
        next(err);
    }
}
