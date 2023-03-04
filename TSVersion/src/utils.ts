import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

// PASSWORDS
export function comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
};

export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 11);
};

// JWT
export function signToken(payload: Object): string {
    return jwt.sign(payload, process.env.JWT_SECRET || ' top secret ');
}

// TEAM CODE
export function genTeamCode() {
    return nanoid(6);
}

// TRANSLATION
export function translateFormat(str: string): { noun: string[], prep: string[] } {
    // the input string is in the format of "words... {noun} words... [prep] words..."
    // the output is an object with two arrays: noun and prep translated to spanich from the input string
    throw new Error('Not implemented');
    return {
        noun: [],
        prep: []
    }
}

export function pseudoRandom(seed: number): number {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export function shuffle(array: any[], seed: number): any[] {

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(pseudoRandom(seed) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export function distributeOptions(options: (any & { correct: boolean })[], index: number, size: 1 | 2 | 3): (any & { correct: boolean })[2] {
    // the input is an array of options, an index of the correct option, and the size of the array to return
    // the output is an array of options with the correct option in the index position
    // if the size is 1, the output is an array with one element, the correct option
    // if the size is 2, the output is an array with two elements, the correct option and a random option
    // if the size is 3, the output is an array with three elements, the correct option and two random options
    throw new Error('Not implemented');
    return [];
}

// GROUP BY
// export function groupBy<T, K extends keyof T>(arr: T[], key: K): Record<T[K], T[]> {
// export function groupBy<T>(arr: T[], fn: (item: T) => any) {
//     return arr.reduce<Record<string, T[]>>((prev, curr) => {
//         const groupKey = fn(curr);
//         const group = prev[groupKey] || [];
//         group.push(curr);
//         return { ...prev, [groupKey]: group };
//     }, {});
// }
export function groupBy(arr: any[], key: string): any[] {
    return Object.values(arr.reduce((groups, item) => {
        const groupKey = item[key];
        const group = groups[groupKey] || [];
        group.push(item);
        return { ...groups, [groupKey]: group };
    }, {}));
}

export function verifyToken<T=any>(token: string): T | false {
    // the input is a token
    // the output is true if the token is valid, false otherwise
    
    try{
        const payload: T | any = jwt.verify(token, process.env.SECRET || " top_secret ")
        return payload;
    }catch(e){
        return false;
    }
}

export function getIdFromToken(token: string): number {
    // the input is a token
    // the output is the id of the user that generated the token
    
    // check if token is valid
    if (!token) {
        return -1;
    }
    const payload = verifyToken<{id: number}>(token);
    if (!payload) {
        return -1;
    }
    return payload.id;
}
