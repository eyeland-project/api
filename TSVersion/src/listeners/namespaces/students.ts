import { Socket } from "socket.io";
import { deleteSocket, printDirectory } from "../utils";
import { getCourseFromStudent } from "../../services/student.service";
import { getCourseById } from "../../services/course.service";
import { getIdFromToken } from "../../utils";

export const directory = new Map<number, Socket>();

export function onConnection(socket: Socket) {
    console.log('S: New student connection', socket.id);

    // EVENTS
    socket.on('id', onId);
    socket.on('join', onId);
    socket.on('disconnect', onDisconnect);
    socket.handshake.auth

    // FUNCTIONS
    async function onId(id: number | string, cb: (session: {session: boolean}) => void) {
        // check if id is string
        if (typeof id === 'string'){
            // check if id is a number
            if (isNaN(Number(id))){
                // then it's a token
                //* console.log('S: student token', id);
                // Check and get id from token
                id = getIdFromToken(id);
                if (id === -1){
                    console.log('S: student invalid token', socket.id);
                    socket.disconnect();
                    return;
                }
            }else{
                id = Number(id);
            }
        }else if (typeof id !== 'number'){
            console.log('S: student invalid id', id);
            socket.disconnect();
            return;
        }
        
        console.log('S: Student id', id);
        // console.log('S: id type', typeof id);
        // id = typeof id === 'object'? id.id : Number(id);

        const idCourse = await validConnection(id);
        if (idCourse === -1) {
            console.log('S: student invalid connection', socket.id);
            socket.disconnect();
            return;
        }
        socket.join('c' + idCourse);
        directory.set(id, socket);
        printStudentsDir();

        const { session } = await getCourseById(idCourse);
        if(!cb){
            console.log('S: student invalid callback', socket.id);
            console.log(cb);
            return;
        }
        console.log("S: TYPE:",typeof cb);
        if(typeof cb !== 'function'){
            console.log('S: student invalid callback', socket.id);
            console.log(cb);
            return;
        }
        cb({ session });
    }

    function onDisconnect() {
        console.log('S: student disconnected', socket.id);
        deleteSocket(socket, directory);
        printStudentsDir();
    }
}

export function printStudentsDir() {
    printDirectory(directory, 'students');
}

async function validConnection(id: number): Promise<number> {
    // check if student is already in directory
    if (directory.has(id)) return -1;
    
    // check if student is in a course
    let idCourse;
    try {
        idCourse = (await getCourseFromStudent(id)).id_course;
    } catch (err) {
        return -1;
    }
    
    return idCourse;
}
