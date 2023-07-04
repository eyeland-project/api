import { ForeignKey } from "sequelize";
import {
  QuestionCharacter,
  QuestionTopic,
  QuestionType
} from "@interfaces/enums/question.enum";

export interface Question {
  id_question: number;
  id_question_group: ForeignKey<number>;
  question_order: number;
  content: string;
  audio_url?: string | null;
  video_url?: string | null;
  type: QuestionType;
  img_alt?: string | null;
  img_url?: string | null;
  topic?: QuestionTopic | null;
  hint?: string | null;
  character?: QuestionCharacter;
  deleted: boolean;
}

export type QuestionCreation = Omit<Question, "id_question", "deleted">;
