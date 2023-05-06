import { Model, ForeignKey } from "sequelize";
import { QuestionTopic, QuestionType } from "@interfaces/enums/question.enum";

export interface Question {
  id_question: number;
  id_task_stage: ForeignKey<number>;
  question_order: number;
  content: string;
  audio_url?: string | null;
  video_url?: string | null;
  type: QuestionType;
  img_alt?: string | null;
  img_url?: string | null;
  topic: QuestionTopic | null;
  deleted: boolean;
}

export type QuestionCreation = Omit<Question, "id_question", "deleted">;
