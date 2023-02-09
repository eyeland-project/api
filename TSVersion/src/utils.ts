import bcrypt from 'bcrypt';

export function comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
};

export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 11);
};
