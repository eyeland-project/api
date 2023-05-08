import { Model, ForeignKey, DataTypes } from "sequelize";

export interface Answer {
  id_answer: number;
  id_question: ForeignKey<number>;
  id_option?: ForeignKey<number> | null;
  id_team?: ForeignKey<number> | null;
  id_task_attempt: ForeignKey<number>;
  answer_seconds?: number | null;
  audio_url?: string | null;
  text?: string | null;
}

export type AnswerCreation = Omit<Answer, "id_answer">;
