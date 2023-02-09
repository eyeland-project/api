import { Request, Response } from 'express';

export async function login(req: Request<{ username: string, password: string }>, res: Response) {
    res.status(200).json({ message: 'Login' });
}

export async function loginTeam(req: Request, res: Response) {
    res.status(200).json({ message: 'Login Team' });

}

export async function logoutTeam(req: Request, res: Response) {
    res.status(200).json({ message: 'Logout Team' });

}
