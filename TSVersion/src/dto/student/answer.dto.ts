export interface AnswerOptionCreateDto {
  idOption: number;
  answerSeconds?: number;
  newAttempt?: boolean | null;
}

export interface AnswerAudioCreateDto {
  idOption?: number;
  answerSeconds?: number;
  // audio?: Buffer;
  newAttempt?: boolean | null;
}
