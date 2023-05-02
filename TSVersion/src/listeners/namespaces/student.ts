import { Socket } from "socket.io";
import { deleteSocket, findId, printDirectory } from "@listeners/utils";
import { getCourseFromStudent } from "@services/student.service";
import { getIdFromToken } from "@utils";
import { leaveTeam } from "@services/team.service";
import { Namespaces, of } from "@listeners/sockets";
import * as repositoryService from "@services/repository.service";
import { CourseModel, StudentModel } from "@models";
import { finishStudentTaskAttempts } from "@services/taskAttempt.service";
import { IncommingEvents, ErrorMessages } from "@interfaces/enums/socket.enum";
import { Student } from "@interfaces/Student.types";

export const directory = new Map<number, Socket>();

export function onConnection(socket: Socket) {
  console.log("S: New student connection", socket.id);

  // EVENTS
  socket.on(IncommingEvents.JOIN, onJoin);
  socket.on(IncommingEvents.DISCONNECT, onDisconnect);
  socket.handshake.auth;

  // FUNCTIONS
  async function onJoin(
    id: number | string,
    cb?: (info: {
      session?: boolean;
      error?: {
        message: ErrorMessages;
      };
    }) => void
  ) {
    // check if id is string
    if (typeof id === "string") {
      // check if id is a number
      const idNumber = parseInt(id);
      if (isNaN(idNumber)) {
        // then it's a token
        // Check and get id from token
        id = getIdFromToken(id);
        if (id === -1) {
          console.log("S: student invalid token", socket.id);
          socket.disconnect();
          return;
        }
      } else {
        id = idNumber;
      }
    } else if (typeof id !== "number") {
      console.log("S: student invalid id", id);
      if (typeof cb === "function") {
        cb({
          error: {
            message: ErrorMessages.INVALID_ID
          }
        });
      } else {
        socket.disconnect();
      }
      return;
    }

    console.log("S: Student id", id);

    // check if student is already in directory
    const prevSocket = directory.get(id);
    if (prevSocket) {
      if (typeof cb === "function") {
        cb({
          error: {
            message: ErrorMessages.ALREADY_CONNECTED
          }
        });
      } else {
        socket.disconnect();
      }
      return;
    }

    // check if student is in a course
    let student: StudentModel;
    try {
      student = await repositoryService.findOne<StudentModel>(StudentModel, {
        where: { id_student: id, deleted: false },
        attributes: ["id_course"],
        include: [
          {
            model: CourseModel,
            as: "course",
            attributes: ["session"],
            where: { deleted: false }
          }
        ]
      });
    } catch (err) {
      if (typeof cb === "function") {
        cb({
          error: {
            message: ErrorMessages.STUDENT_NOT_FOUND
          }
        });
      } else {
        socket.disconnect();
      }
      return;
    }

    socket.join("c" + student.id_course);
    directory.set(id, socket);
    if (typeof cb === "function") cb({ session: student.course.session });
    printStudentsDir();
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
