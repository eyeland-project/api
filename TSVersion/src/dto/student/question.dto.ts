import { QuestionTopic, QuestionType } from "@interfaces/enums/question.enum";

export interface QuestionResp {
  id: number;
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

// pretasks
export interface PretaskResp {
  description: string;
  keywords: string[];
  numQuestions: number;
}

export type PretaskQuestionResp = Omit<QuestionResp, "audioUrl" | "videoUrl">;

// duringtasks
export interface DuringtaskResp {
  description: string;
  keywords: string[];
  numQuestions: number;
}

export interface DuringtaskQuestionResp extends QuestionResp {
  nounTranslation: string[];
  prepositionTranslation: string[];
}

// postasks
export interface PostaskResp {
  description: string;
  keywords: string[];
  numQuestions: number;
}

export interface PostaskQuestionResp extends QuestionResp {}
