import { Express } from 'express';
import { Socket, Server } from 'socket.io';
import { createServer } from 'http';

let io: Server;

export const directory = new Map<number, Socket>();

export const NAMESPACES = {
    students: '/students',
    teachers: '/teachers'
}

export default function sockets(app: Express) {
    const server = createServer(app);
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', onConnection);
    io.on('error', onError);
    return server;
}

function onConnection(socket: Socket) {
    console.log('Socket: New connection', socket.id);

    socket.on('disconnect', () => {
        console.log('Socket: user disconnected');
    });
}

function onError(error: Error) {
    console.log('Socket: Error', error);
}

export function emit(event: string, data: any) {
    if (io) {
        io.emit(event, data);
        console.log('Socket: Emitting', event, data);
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