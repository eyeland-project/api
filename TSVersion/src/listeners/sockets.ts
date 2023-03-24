import { Server as IO } from "socket.io";
import { Server } from "http";
import { onConnection as onStudentConnection } from "./namespaces/students";
import { onConnection as onTeacherConnection } from "./namespaces/teachers";

let io: IO;

export enum Namespaces {
  STUDENTS = "/students",
  TEACHERS = "/teachers"
}

export default function initSocket(server: Server): Server {
  io = new IO(server);

  // students
  io.of(Namespaces.STUDENTS).on("connection", onStudentConnection);
  io.of(Namespaces.STUDENTS).on("error", onError);

  // teachers
  io.of(Namespaces.TEACHERS).on("connection", onTeacherConnection);
  io.of(Namespaces.TEACHERS).on("error", onError);

  return server;
}

function onError(error: Error) {
  console.log("S: Error", error);
}

// EXPORT FUNCTIONS
export function emit(event: string, data: any) {
  if (io) {
    io.emit(event, data);
    console.log("S: Emitting", event, data);
  }
}

export function on(event: string, callback: (data: any) => void) {
  if (io) {
    io.on(event, callback);
  }
}

export function of(namespace: Namespaces) {
  if (io) {
    return io.of(namespace);
  }
}
