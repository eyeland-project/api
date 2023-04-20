export interface AnswerCreateDto {
  answerSeconds: number;
  idOption: number;
  newAttempt?: boolean | null;
}
