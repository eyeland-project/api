import { Request, Response } from 'express';
import passport from 'passport';
import StudentModel from '../../models/Student';
import { signToken } from '../../utils';

// login with passport
export async function login(req: Request, res: Response, next: Function) {
    passport.authenticate('login', async (err, id, info) => {
        try {
            if (err || !id) {
                console.log(err);

                return next(new Error('An Error occured'));
            }
            const student = await StudentModel.findByPk(id);
            if (!student) return next(new Error('Student not found'));
            
            req.login(id, { session: false }, async (err) => {
                if (err) return next(err);
                const token = signToken({ id });
                res.status(200).json({
                    token,
                    hasTeam: student.current_team !== null,
                });
            });
        } catch (err) {
            console.error(err);
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
