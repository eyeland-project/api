/// <reference path="../../types/customTypes.d.ts" />

import { Request, Response } from 'express';
import { getStudentById, getTeamFromStudent } from '../../services/student.service';
import { addStudentToTeam, assignPowersAuto, removeStudentFromTeam } from '../../services/team.service';
import { ApiError } from '../../middlewares/handleErrors';
import { LoginTeamReq } from '../../types/requests/students.types';
import { getTeamsFromCourse } from '../../services/team.service';
import { TeamResp } from '../../types/responses/students.types';

export async function getTeams(req: Request, res: Response<TeamResp[]>, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
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

    let prevTeam;
    try {
        if (!code || !taskOrder) throw new ApiError('Missing code or taskOrder', 400);
        try {
            prevTeam = await getTeamFromStudent(idUser); // check if student is already in a team; if not, throw error
        } catch (err) { } // no team found for student (expected)

        await addStudentToTeam(idUser, code, taskOrder);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }
    try {
        if (prevTeam) {
            // TODO: send notification to old team
        }
        await assignPowersAuto(code);
        console.log('Powers assigned');
        
        // TODO: send notification to new team
    } catch (err) {
        console.log(err);
    }
}

export async function leaveTeam(req: Request, res: Response, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
        await removeStudentFromTeam(idUser);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }
}
