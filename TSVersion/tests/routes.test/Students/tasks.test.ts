import { api } from '../utils';
import { initialTasks } from '../../mocks';
import Tasks from '../../../src/models/Tasks';

// beforeEach(async () => {
//     // limpiamos la database
//     await Tasks.destroy({ truncate: true });

//     // poblamos la base de datos
//     await Tasks.bulkCreate(initialTasks);
// });

// describe('GET /tasks', () => {
//     /*
//         the response format is just 
//         {
//             "numberOfTasks": 0,
//             "availableTasks": 0
//         }
//     */
//     it('should return all tasks', async () => {
//         const response = await api
//             .get('/tasks')
//             .expect(200)
//             .expect('Content-Type', /application\/json/);

//         expect(response.body.numberOfTasks).toBe(3);
//         expect(response.body.availableTasks).toBe(3);
//     });


// });