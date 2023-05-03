export enum IncommingEvents {
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  JOIN = "join"
}

export enum OutgoingEvents {
  TEAM_UPDATE = "team:student:update",
  TEAMS_UPDATE = "teams:student:update",

  SESSION_CREATE = "session:teacher:create",
  SESSION_END = "session:teacher:end",
  SESSION_START = "session:teacher:start",

  ANSWER = "team:student:answer",
  STUDENT_LEAVE = "team:student:leave",

  LEADER_BOARD_UPDATE = "course:leaderboard:update"
}

export enum ErrorMessages {
  ALREADY_CONNECTED = "error:already_connected",
  INVALID_CONNECTION = "error:invalid_connection",
  INVALID_ID = "error:invalid_id",
  SERVER_ERROR = "error:server_error",
  STUDENT_NOT_FOUND = "error:student_not_found"
}
