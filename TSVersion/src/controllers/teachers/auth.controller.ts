import { Request, Response } from 'express';
import passport from 'passport';
import { signToken } from '../../utils';

// login with passport
export async function login(req: Request, res: Response, next: Function) {
    passport.authenticate('login', async (err, id, info) => {
        try {
            if (err || !id) {
                console.log(err);

                return next(new Error('An Error occured'));
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
