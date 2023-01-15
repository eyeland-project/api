import app from '../../src/app';
import supertest from 'supertest';
export const api = supertest(app);

export const initialTasks = [
    {
        nombre: 'Tarea 1',
        descripcion: 'Descripción de la tarea 1',
        orden: 1,
        mensajepretask: 'Mensaje pre tarea 1',
        mensajeintask: 'Mensaje in tarea 1',
        mensajepostask: 'Mensaje post tarea 1'
    },
    {
        nombre: 'Tarea 2',
        descripcion: 'Descripción de la tarea 2',
        orden: 2,
        mensajepretask: 'Mensaje pre tarea 2',
        mensajeintask: 'Mensaje in tarea 2',
        mensajepostask: 'Mensaje post tarea 2'
    },
    {
        nombre: 'Tarea 3',
        descripcion: 'Descripción de la tarea 3',
        orden: 3,
        mensajepretask: 'Mensaje pre tarea 3',
        mensajeintask: 'Mensaje in tarea 3',
        mensajepostask: 'Mensaje post tarea 3'
    }
];