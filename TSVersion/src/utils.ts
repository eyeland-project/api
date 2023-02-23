import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

export function comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
};

export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 11);
};

export function signToken(payload: Object): string {
    return jwt.sign(payload, process.env.JWT_SECRET || ' top secret ');
}

export function genTeamCode() {
    return nanoid(6);
}
