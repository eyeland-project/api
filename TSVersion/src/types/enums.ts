export enum Power {
  SUPER_HEARING = "super_hearing",
  MEMORY_PRO = "memory_pro",
  SUPER_RADAR = "super_radar"
}

export enum QuestionType {
  FLASHCARD = "flashcard",
  FILL = "fill",
  ORDER = "order",
  SELECT = "select",
  AUDIO = "audio"
}

export enum QuestionTopic {
  VOCABULARY = "vocabulary",
  PREPOSITIONS = "prepositions"
}

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
