import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@app$': '<rootDir>/src/app',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@models$': '<rootDir>/src/models/index',
    '^@routes$': '<rootDir>/src/routes/index',
    '^@utils$': '<rootDir>/src/utils',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@dto/(.*)$': '<rootDir>/src/dto/$1',
    '^@listeners/(.*)$': '<rootDir>/src/listeners/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1'
  },
  testMatch: [
    '**/tests/**/*.test.ts',
  ],
};

export default config;
