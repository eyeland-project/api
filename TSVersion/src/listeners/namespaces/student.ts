import { Socket } from "socket.io";
import { deleteSocket, findId, printDirectory } from "@listeners/utils";
import { getCourseFromStudent } from "@services/student.service";
import { getIdFromToken } from "@utils";
import { leaveTeam } from "@services/team.service";
import { Namespaces, of } from "@listeners/sockets";
import * as repositoryService from "@services/repository.service";
import { CourseModel } from "@models";
import { finishStudentTaskAttempts } from "@services/taskAttempt.service";

export const directory = new Map<number, Socket>();

export function onConnection(socket: Socket) {
  console.log("S: New student connection", socket.id);

  // EVENTS
  socket.on("join", onJoin);
  socket.on("disconnect", onDisconnect);
  socket.handshake.auth;

  // FUNCTIONS
  async function onJoin(
    id: number | string,
    cb?: (session: { session: boolean }) => void
  ) {
    // check if id is string
    if (typeof id === "string") {
      // check if id is a number
      if (isNaN(Number(id))) {
        // then it's a token
        //* console.log('S: student token', id);
        // Check and get id from token
        id = getIdFromToken(id);
        if (id === -1) {
          console.log("S: student invalid token", socket.id);
          socket.disconnect();
          return;
        }
      } else {
        id = Number(id);
      }
    } else if (typeof id !== "number") {
      console.log("S: student invalid id", id);
      socket.disconnect();
      return;
    }

    console.log("S: Student id", id);

    // check if student is already in directory
    const prevSocket = directory.get(id);
    if (prevSocket) {
      console.log("S: student already connected", socket.id);
      try {
        await leaveTeam(id, socket); // leave team room is done in leaveTeam function
      } catch (err) {
        console.log("S: error on leave team", err);
      }
      prevSocket.disconnect();
    }

    // check if student is in a course
    let idCourse;
    try {
      idCourse = (await getCourseFromStudent(id)).id_course;
    } catch (err) {
      return;
    }

    if (idCourse === -1) {
      console.log("S: student invalid connection", socket.id);
      socket.disconnect();
      return;
    }
    socket.join("c" + idCourse);
    directory.set(id, socket);
    printStudentsDir();

    const { session } = await repositoryService.findOne<CourseModel>(
      CourseModel,
      { where: { id_course: idCourse } }
    );

    if (!cb || typeof cb !== "function") return;
    cb({ session });
  }

  async function onDisconnect() {
    console.log("S: student disconnected", socket.id);
    const idStudent = findId(socket, directory);
    if (idStudent === -1) return;
    try {
      await leaveTeam(idStudent, socket); // leave team room is done in leaveTeam function
      await finishStudentTaskAttempts(idStudent);
    } catch (err) {
      console.log("S: error on leave team", err);
    }
    try {
      socket.leave("c" + (await getCourseFromStudent(idStudent)).id_course);
    } catch (err) {
      console.log("S: error on leave course", err);
    }

    // delete from directory at the end because it's needed for leaveTeam function
    deleteSocket(socket, directory);
    printStudentsDir();
  }
}

export function printStudentsDir() {
  printDirectory(directory, "students");
}

export function getNamespace() {
  return of(Namespaces.STUDENTS)!;
}

export function emitTo(room: string, event: string, data: any) {
  getNamespace().to(room).emit(event, data);
  console.log("S: Emitting", event, data);
}
