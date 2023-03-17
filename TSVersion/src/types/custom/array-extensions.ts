import { pseudoRandom } from "../../utils";
// array-extensions.ts
export {};

declare global {
  interface Array<T> {
    shuffle: (seed: number) => T[];
  }
}

Array.prototype.shuffle = function <T>(seed: number): T[] {
  return this.sort(() => pseudoRandom(seed) - 0.5);
};
// Array with random items
Array.from({ length: 6 }, (_, k) => k + 1);
