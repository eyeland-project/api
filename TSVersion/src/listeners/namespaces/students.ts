import { Socket } from "socket.io";
import { deleteSocket, printDirectory, validConnection } from "../utils";
import { dirStudents } from "../state";

export function onStudentConnection(socket: Socket) {
    console.log('S: New student connection', socket.id);

    // EVENTS
    socket.on('id', onId);
    socket.on('disconnect', onDisconnect);

    // FUNCTIONS
    function onId(id: number) {
        console.log('S: Student id', id);
        if (!validConnection(id, dirStudents)) {
            console.log('S: student invalid connection', socket.id);
            socket.disconnect();
            return;
        }
        dirStudents.set(id, socket);
        printStudentsDir();
    }

    function onDisconnect() {
        console.log('S: student disconnected', socket.id);
        deleteSocket(socket, dirStudents);
        printStudentsDir();
    }
}

function printStudentsDir() {
    printDirectory(dirStudents, 'students');
}
