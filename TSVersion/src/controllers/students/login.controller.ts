import { Request, Response } from 'express';
import passport from 'passport';

// login with passport
export async function login(req: Request, res: Response, next: Function) {
    passport.authenticate('login', async (err, token, info) => {
        try {
            if (err || !token) {
                return next(new Error('An Error occured'));
            }
            req.login(token, { session: false }, async (err) => {
                if (err) return next(err);
                res.status(200).json({ token });
            });
        } catch (err) {
            return next(err);
        }
    })(req, res, next);
}

export async function loginTeam(req: Request, res: Response) {
    res.status(200).json({ message: 'Login Team' });

}

export async function logoutTeam(req: Request, res: Response) {
    res.status(200).json({ message: 'Logout Team' });

}
