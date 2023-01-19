import app from '../../src/app';
import supertest from 'supertest';
export const api = supertest(app);