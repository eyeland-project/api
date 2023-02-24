import { Socket } from "socket.io";
import { deleteSocket, printDirectory, validConnection } from "../utils";
import { dirTeachers } from "../state";

export function onTeacherConnection(socket: Socket) {
    console.log('S: New teacher connection', socket.id);

    // EVENTS
    socket.on('id', onId);
    socket.on('disconnect', onDisconnect);

    // FUNCTIONS
    function onId(id: number) {
        console.log('S: teacher id', id);
        if (!validConnection(id, dirTeachers)) {
            console.log('S: teacher invalid connection', socket.id);
            socket.disconnect();
            return;
        }
        dirTeachers.set(id, socket);
        printTeachersDir();
    }

    function onDisconnect() {
        console.log('S: teacher disconnected', socket.id);
        deleteSocket(socket, dirTeachers);
        printTeachersDir();
    }
}

function printTeachersDir() {
    printDirectory(dirTeachers, 'teachers');
}
