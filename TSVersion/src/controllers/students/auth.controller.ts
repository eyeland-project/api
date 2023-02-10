import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// login with passport
export async function login(req: Request, res: Response, next: Function) {
    passport.authenticate('login', async (err, id, info) => {
        try {
            if (err || !id) {
                return next(new Error('An Error occured'));
            }
            req.login(id, { session: false }, async (err) => {
                if (err) return next(err);
                const body = { _id: id };
                const token = jwt.sign({ user: body }, process.env.JWT_SECRET || ' top secret ' );
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
