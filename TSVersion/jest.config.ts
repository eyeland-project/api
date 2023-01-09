import type { Config } from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  }, 
  // globals: {
  //   "ts-jest": {
  //     "tsConfigFile": "tsconfig.json",
  //   }
  // },
  // testMatch: [
  //   "**/__tests__/*.+(ts|tsx|js)"
  // ]
};
export default config;