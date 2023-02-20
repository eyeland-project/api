/// <reference path="../../types/customTypes.d.ts" />

import { Request, Response } from 'express';
import passport from 'passport';
import { signToken } from '../../utils';
import { joinTeam, leaveTeam } from '../../services/student.service';
import { ApiError } from '../../middlewares/handleErrors';
import { LoginTeamReq } from '../../types/requests/students.types';

// login with passport
export async function login(req: Request, res: Response, next: Function) {
    passport.authenticate('login', async (err, id, info) => {
        try {
            if (err || !id) {
                return next(new ApiError('Internal server error'));
            }
            req.login(id, { session: false }, async (err) => {
                if (err) return next(err);
                const token = signToken({ id });
                res.status(200).json({ token });
            });
        } catch (err) {
            console.error(err);
            return next(err);
        }
    })(req, res, next);
}

export async function loginTeam(req: Request<LoginTeamReq>, res: Response, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
        const { code, taskOrder } = req.body as LoginTeamReq;
        if (!code || !taskOrder) throw new ApiError('Missing code or taskOrder', 400);
        await joinTeam(idUser, code, taskOrder);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }
}

export async function logoutTeam(req: Request, res: Response, next: Function) {
    try {
        const { id: idUser } = req.user as ReqUser;
        await leaveTeam(idUser);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }
}
