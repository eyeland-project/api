import { QuestionTopic, QuestionType } from "@interfaces/enums/question.enum";

export interface QuestionDetailDto {
  id: number;
  questionOrder: number;
  content: string;
  type: QuestionType;
  topic: QuestionTopic | null;
  imgAlt: string | null;
  imgUrl: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
  options: {
    id: number;
    content: string;
    correct: boolean;
    feedback: string;
  }[];
}

export type QuestionPretaskDetailDto = Omit<
  QuestionDetailDto,
  "audioUrl" | "videoUrl"
>;

export interface QuestionDuringtaskDetailDto extends QuestionDetailDto {
  questionOrder: number;
  nounTranslation: string[];
  prepositionTranslation: string[];
}

export interface QuestionPostaskDetailDto extends QuestionDetailDto {}
