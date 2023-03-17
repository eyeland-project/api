import { AnswerModel } from "../models";
import { Answer, AnswerCreation } from "../types/Answer.types";

export async function createAnswer(
  idQuestion: number,
  idOption: number,
  answerSeconds: number,
  idTaskAttempt: number
): Promise<Answer> {
  return await AnswerModel.create({
    id_question: idQuestion,
    id_task_attempt: idTaskAttempt,
    id_option: idOption,
    answer_seconds: answerSeconds
  });
}
