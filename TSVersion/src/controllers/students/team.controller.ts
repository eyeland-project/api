

import { Request, Response } from 'express';
import { getStudentById, joinTeam as joinT, leaveTeam as leaveT } from '../../services/student.service';
import { ApiError } from '../../middlewares/handleErrors';
import { LoginTeamReq } from '../../types/requests/students.types';
import { getTeamsFromCourse } from '../../services/team.service';
import { TeamResp } from '../../types/responses/students.types';

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
    try {
        const { id: idUser } = req.user!;
        const { code, taskOrder } = req.body as LoginTeamReq;
        if (!code || !taskOrder) throw new ApiError('Missing code or taskOrder', 400);
        await joinT(idUser, code, taskOrder);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }
}

export async function leaveTeam(req: Request, res: Response, next: Function) {
    try {
        const { id: idUser } = req.user!;
        await leaveT(idUser);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }
}
