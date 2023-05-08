export interface AnswerSelectCreateDto {
  idOption: number;
  answerSeconds?: number;
  newAttempt?: boolean | null;
}

export interface AnswerSelectSpeakingCreateDto {
  idOption: number;
  answerSeconds?: number;
  newAttempt?: boolean | null;
}

export interface AnswerOpenCreateDto {
  answerSeconds?: number;
  newAttempt?: boolean | null;
  text?: string;
}
