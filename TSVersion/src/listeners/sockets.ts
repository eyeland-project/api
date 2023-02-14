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

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    return server;
}
