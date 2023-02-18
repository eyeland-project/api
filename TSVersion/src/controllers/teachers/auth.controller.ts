import { Request, Response } from 'express';
import passport from 'passport';
import { signToken } from '../../utils';
import { ApiError } from '../../middlewares/handleErrors';

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
