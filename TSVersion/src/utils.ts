import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { Power } from "@interfaces/enums/taskAttempt.enum";

// PASSWORDS
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 11);
}

// JWT
export function signToken(payload: Object): string {
  return jwt.sign(payload, process.env.JWT_SECRET || " top secret ");
}

// TEAM CODE
export function genTeamCode(teamId?: number) {
  if (!teamId) return nanoid(6);
  return `${teamId}-${nanoid(4)}`.slice(0, 6);
}

export function separateTranslations(content: string): {
  content: string;
  nouns: string[];
  preps: string[];
} {
  const regex = /(\{[^\|]*\|[^\}]*\})|(\[[^\|]*\|[^\]]*\])/g;
  const matches = content.match(regex);
  if (!matches) return { content, nouns: [], preps: [] };

  const nouns: string[] = [];
  const preps: string[] = [];

  matches.forEach((match) => {
    const transl = match.slice(1, match.length - 1).split("|")[1];
    (match[0] === "{" ? nouns : preps).push(transl);
    content = content.replace(match, match.replace(/\|.*/, "") + match.at(-1));
  });

  return { content, nouns, preps };
}

export function pseudoRandom(seed: number): number {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function shuffle<T>(array: T[], seed?: number): T[] {
  if (seed === undefined) return [...array].sort(() => Math.random() - 0.5);
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom(seed) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function indexPower(power: Power) {
  switch (power) {
    case Power.SUPER_HEARING:
      return 0;
    case Power.MEMORY_PRO:
      return 1;
    case Power.SUPER_RADAR:
      return 2;
    default:
      return 0;
  }
}

export function distributeOptions(
  options: { correct: boolean; [key: string]: any }[],
  index: number,
  size: number
): { correct: boolean; [key: string]: any }[2] {
  let paquete: number = 0;
  console.log(index, options.length);

  for (let i = 0; i < 6; i = i + 2) {
    if (options[i].correct || options[i + 1].correct) {
      paquete = i;
    }
  }

  let res = null;
  if (size == 1) {
    res = [options[paquete], options[paquete + 1]];
  }

  if (size == 2) {
    if (paquete == 0) {
      if (index == 1) {
        res = [options[0], options[1]];
      }
      if (index == 2) {
        res = [options[2], options[3]];
      }
    }

    if (paquete == 2) {
      if (index == 1) {
        res = [options[2], options[3]];
      }
      if (index == 2) {
        res = [options[4], options[5]];
      }
    }

    if (paquete == 4) {
      if (index == 2) {
        res = [options[4], options[5]];
      }
      if (index == 1) {
        res = [options[2], options[3]];
      }
    }
  }

  if (size == 3) {
    if (index == 1) {
      res = [options[0], options[1]];
    }
    if (index == 2) {
      res = [options[2], options[3]];
    }
    if (index == 3) {
      res = [options[4], options[5]];
    }
  }

  return res && shuffle(res);
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
export function groupBy<T = any>(arr: T[], key: keyof T): T[][] {
  return Object.values(
    arr.reduce<{ [key: string]: T[] }>((groups, item) => {
      const groupKey = item[key] as string;
      const group = groups[groupKey] || [];
      group.push(item);
      return { ...groups, [groupKey]: group };
    }, {})
  );
}

export function verifyToken<T = any>(token: string): T | false {
  // the input is a token
  // the output is true if the token is valid, false otherwise

  try {
    const payload: T | any = jwt.verify(
      token,
      process.env.JWT_SECRET || " top secret "
    );
    return payload;
  } catch (e) {
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
  const payload = verifyToken<{ id: number }>(token);
  if (!payload) {
    return -1;
  }
  return payload.id;
}

let counter = 0;
export function incrementCounter(): number {
  return counter++;
}

const teamNamesConst = ["Equipo"];

export async function generateTeamName(usedTeamName: string[] = []) {
  let count = 1;
  const teamNameBase =
    teamNamesConst[Math.floor(Math.random() * teamNamesConst.length)];
  let teamName = teamNameBase + ` ${count}`;
  while (usedTeamName.includes(teamName)) {
    count++;
    teamName = teamNameBase + ` ${count}`;
  }
  return teamName;
}

export function getRandomFloatBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
