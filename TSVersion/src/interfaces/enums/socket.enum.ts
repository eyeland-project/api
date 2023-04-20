export enum IncommingEvents {
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  ERROR = "error",
  JOIN = "join"
}

export enum OutgoingEvents {
  TEAM_UPDATE = "team:student:update",
  TEAMS_UPDATE = "teams:student:update",

  SESSION_CREATE = "session:teacher:create",
  SESSION_END = "session:teacher:end",
  SESSION_START = "session:teacher:start",

  ANSWER = "team:student:answer",

  LEADER_BOARD_UPDATE = "course:leaderboard:update"
}
