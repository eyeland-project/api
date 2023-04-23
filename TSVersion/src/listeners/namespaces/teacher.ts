import { Socket } from "socket.io";
import { deleteSocket, printDirectory } from "@listeners/utils";
import { getCourses } from "@services/course.service";

export const directory = new Map<number, Socket>();

export function onConnection(socket: Socket) {
  console.log("S: New teacher connection", socket.id);

  // EVENTS
  socket.on("join", onJoin);
  socket.on("disconnect", onDisconnect);

  // FUNCTIONS
  async function onJoin(id: number) {
    console.log("S: teacher id", id);
    if (!validConnection(id)) {
      console.log("S: teacher invalid connection", socket.id);
      socket.disconnect();
      return;
    }
    directory.set(id, socket);

    try {
      const coursesIds = (await getCourses(id)).map((course) => course.id);

      // join courses rooms
      coursesIds.forEach((courseId) => {
        socket.join(`c${courseId}`);
      });
    } catch (err) {
      console.log("S: error on join course", err);
    }
    printTeachersDir();
  }

  function onDisconnect() {
    console.log("S: teacher disconnected", socket.id);
    deleteSocket(socket, directory);
    printTeachersDir();
  }
}

function printTeachersDir() {
  printDirectory(directory, "teachers");
}

function validConnection(id: number): boolean {
  return !directory.has(id);
}
