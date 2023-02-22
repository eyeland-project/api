

import { Request, Response } from 'express';
import { assignPowerToStudent, getStudentById, getTeamFromStudent } from '../../services/student.service';
import { addStudentToTeam, getTeamMembers, removeStudentFromTeam } from '../../services/team.service';
import { ApiError } from '../../middlewares/handleErrors';
import { LoginTeamReq } from '../../types/requests/students.types';
import { getTeamsFromCourse } from '../../services/team.service';
import { TeamMemberSocket, TeamResp } from '../../types/responses/students.types';
import { getStudentCurrTaskAttempt } from '../../services/taskAttempt.service';

export async function getTeams(req: Request, res: Response<TeamResp[]>, next: Function) {
    try {
        const {id: idUser} = req.user!;
        const { id_course } = await getStudentById(idUser);
        const teams = await getTeamsFromCourse(id_course);
        res.status(200).json(teams.filter(t => t.active).map(({ name, code, id_team: id }) => ({
            id,
            name,
            code: code || '',
        })));
    } catch (err) {
        next(err);
    }
}

export async function joinTeam(req: Request<LoginTeamReq>, res: Response, next: Function) {
    const { id: idUser } = req.user as ReqUser;
    const { code, taskOrder } = req.body as LoginTeamReq;

    if (!code || !taskOrder) return next(new ApiError('Missing code or taskOrder', 400));
    let prevTeam;
    try {
        prevTeam = await getTeamFromStudent(idUser); // check if student is already in a team; if not, throw error
    } catch (err) { } // no team found for student (expected)

    try {
        await addStudentToTeam(idUser, code, taskOrder);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }

    try {
        if (prevTeam) {
            // TODO: send notification to old team
        }
        const members: TeamMemberSocket[] = (await getTeamMembers(code)).map(({
            id_student: id, first_name, last_name, username, task_attempt: { power }
        }) => ({
            id, first_name, last_name, username, power
        }));
        console.log('members', members);
        
        // TODO: send notification to new team
    } catch (err) {
        console.log(err);
    }
}

export async function leaveTeam(req: Request, res: Response, next: Function) {
    const { id: idUser } = req.user as ReqUser;

    let code;
    try {
        code = (await getTeamFromStudent(idUser)).code; // check if student is in a team; if not, throw error
    } catch (err) { }
    
    try {
        await removeStudentFromTeam(idUser);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }
    
    if (!code) return;
    try {
        // check if this student had super_hearing to assign it to another student
        const { power } = await getStudentCurrTaskAttempt(idUser);
        if (power !== 'super_hearing') return; // student doesn't have super_hearing
        
        const teammates = (await getTeamMembers(code)).filter(({ id_student }) => id_student !== idUser);
        if (!teammates.length) return; // no teammates left
        
        const blindnessLevels = teammates.map(({ blindness_acuity: { level } }) => level);
        const maxBlindnessLevel = Math.max(...blindnessLevels);
        if (maxBlindnessLevel === 0) return; // no teammates with blindness

        const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
        const { id_student: idStudent } = teammates[withMaxBlindnessIdx];
        assignPowerToStudent(idStudent, 'super_hearing', teammates.filter(({ id_student }) => id_student !== idStudent));
    } catch (err) {
        console.log(err);
    }
}
