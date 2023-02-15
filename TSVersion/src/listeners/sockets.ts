import { Express } from 'express';
import { Socket, Server } from 'socket.io';
import { createServer } from 'http';

export default function sockets(app: Express) {
    const server = createServer(app);
    const io = new Server(server, {
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
