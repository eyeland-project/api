import { emit } from "../listeners/sockets";

export function sendTeamNotification(teamId: string, message: string) {
  emit("teamNotification", { teamId, message });
}
