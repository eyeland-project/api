// USING Jest and Supertest
// testing / and /ping routes
import { api } from './utils'


describe('GET /', () => {
    it('should return 200 OK', (done) => {
        api.get('/')
            .expect(200, done);
    });
});

describe('GET /ping', () => {
    it('should return 200 OK', (done) => {
        api.get('/ping')
            .expect(200, done);
    });

    it('should return pong', async () => {
        const response = await api.get('/ping');
        
        expect(response.text).toEqual('pong');
    });
});
