import { Socket } from "socket.io";

export function printDirectory(directory: Map<number, Socket>, name?: string) {
  console.log(`S: directory ${name ? `(${name})` : ""} ***`);
  for (let [key, value] of directory) {
    console.log(key, value.id);
  }
}

// find the id (db) of a socket in the directory from its socket
export function findId(socket: Socket, directory: Map<number, Socket>): number {
  for (let [key, value] of directory) {
    if (value.id === socket.id) {
      return key;
    }
  }
  return -1;
}

export function deleteSocket(
  socket: Socket,
  directory: Map<number, Socket>
): boolean {
  const id = findId(socket, directory);
  if (id !== -1) {
    directory.delete(id);
    return true;
  }
  return false;
}
