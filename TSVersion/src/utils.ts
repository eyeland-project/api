import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import translate from "node-traductor";
import { Power } from "./types/enums";

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
export function genTeamCode() {
  return nanoid(6);
}

// *TRANSLATION
async function translateWord(word: string): Promise<string[]> {
  if (!word) return [];
  return translate(word, { to: "es" })
    .then((res) => {
      const traductions: string[] = [];
      //retornar todas las posibles traducciones
      try {
        console.log(res.raw[1][0][0][5][0][4][0][0]);
        let len = res.raw[1][0][0][5][0][4].length;
        for (let i = 0; i < len; i++) {
          traductions.push(res.raw[1][0][0][5][0][4][i][0]);
        }
      } catch (e) {
        traductions.push(res.text);
      }
      // console.log(traductions);
      return traductions;
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
}

export async function translateFormat(
  str: string
): Promise<{ nouns: string[]; preps: string[] }> {
  let noun = str.match(/{(.+?)}/g)?.[0].replace(/[{}]/g, "");
  let prep = str.match(/\[(.+?)\]/g)?.[0].replace(/[\[\]]/g, "");
  //traducir las palabras
  let nouns: string[] = [];
  let preps: string[] = [];
  console.log(noun, prep);
  if (noun) {
    nouns = await translateWord(noun);
  }
  if (prep) {
    preps = await translateWord(prep);
  }

  return { nouns, preps };
}

export function pseudoRandom(seed: number): number {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function shuffle(array: any[], seed: number): any[] {
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

  if (size == 1) {
    return [options[paquete], options[paquete + 1]];
  }

  if (size == 2) {
    if (paquete == 0) {
      if (index == 1) {
        return [options[0], options[1]];
      }
      if (index == 2) {
        return [options[2], options[3]];
      }
    }

    if (paquete == 2) {
      if (index == 1) {
        return [options[2], options[3]];
      }
      if (index == 2) {
        return [options[4], options[5]];
      }
    }

    if (paquete == 4) {
      if (index == 2) {
        return [options[4], options[5]];
      }
      if (index == 1) {
        return [options[2], options[3]];
      }
    }
  }

  if (size == 3) {
    if (index == 1) {
      return [options[0], options[1]];
    }
    if (index == 2) {
      return [options[2], options[3]];
    }
    if (index == 3) {
      return [options[4], options[5]];
    }
  }

  return undefined;
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
  return Object.values(
    arr.reduce((groups, item) => {
      const groupKey = item[key];
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
