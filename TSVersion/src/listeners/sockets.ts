import { Express } from 'express';
import { Socket, Server as IO } from 'socket.io';
import { createServer } from 'http';
import { Server } from 'http';

let io: IO;

export const dirStudents = new Map<number, Socket>();
export const dirTeachers = new Map<number, Socket>();

export enum Namespace {
    STUDENTS = '/students',
    TEACHERS = '/teachers'
}

export default function initSocket(server: Server): Server {
    io = new IO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // students
    io.of(Namespace.STUDENTS).on('connection', onStudentConn);
    io.of(Namespace.STUDENTS).on('error', onError);
    
    // teachers
    io.of(Namespace.TEACHERS).on('connection', onTeacherConn);
    io.of(Namespace.TEACHERS).on('error', onError);
    
    return server;
}

function onStudentConn(socket: Socket) {
    console.log('S: New student connection', socket.id);

    socket.on('id', (id: number) => {
        console.log('S: Student id', id);
        if (!validConn(socket, dirStudents)) {
            console.log('S: student invalid connection', socket.id);
            socket.disconnect();
        }
        dirStudents.set(id, socket);
    });
    
    socket.on('disconnect', () => {
        console.log('S: student disconnected', socket.id);
        const success = deleteSocket(socket, dirStudents);
        console.log('S: student deleted?', success);
        printDirectory(dirStudents);
    });
}

function onTeacherConn(socket: Socket) {
    console.log('S: New teacher connection', socket.id);
    if (!validConn(socket, dirTeachers)) {
        console.log('S: student invalid connection', socket.id);
        socket.disconnect();
        return;
    }

    socket.on('id', (id: number) => {
        console.log('S: teacher id', id);
        dirTeachers.set(id, socket);
        printDirectory(dirTeachers);
    });
    
    socket.on('disconnect', () => {
        console.log('S: teacher disconnected', socket.id);
        const success = deleteSocket(socket, dirTeachers);
        console.log('S: teacher deleted?', success);
        printDirectory(dirTeachers);
    });
}

function onError(error: Error) {
    console.log('S: Error', error);
}

export function emit(event: string, data: any) {
    if (io) {
        io.emit(event, data);
        console.log('S: Emitting', event, data);
    }
}

export function on(event: string, callback: (data: any) => void) {
    if (io) {
        io.on(event, callback);
    }
}

export function of(namespace: string) {
    if (io) {
        return io.of(namespace);
    }
}

function printDirectory(directory: Map<number, Socket>) {
    console.log('S: directory:');
    for (let [key, value] of directory) {
        console.log(key, value.id);
    }
}

// find the id (db) of a socket in the directory from its socket
function findDBId(socket: Socket, directory: Map<number, Socket>): number {
    for (let [key, value] of directory) {
        if (value.id === socket.id) {
            return key;
        }
    }
    return -1;
}

function deleteSocket(socket: Socket, directory: Map<number, Socket>): boolean {
    const id = findDBId(socket, directory);
    if (id !== -1) {
        directory.delete(id);
        return true;
    }
    return false;
}

function validConn(socket: Socket, directory: Map<number, Socket>): boolean {
    console.log('validating...', findDBId(socket, directory) === -1);
    
    return findDBId(socket, directory) === -1;
}
