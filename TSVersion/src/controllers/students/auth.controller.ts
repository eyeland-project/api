

import { Request, Response } from 'express';
import passport from 'passport';
import { signToken } from '../../utils';
import { ApiError } from '../../middlewares/handleErrors';

// login with passport
export async function login(req: Request, res: Response, next: Function) {
    passport.authenticate('login', async (err, { id }, _info) => {
        try {
            if (err) {
                return next(new ApiError(err, 500));
            }else if(!id){
                return next(new ApiError('Wrong credentials', 401));
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
