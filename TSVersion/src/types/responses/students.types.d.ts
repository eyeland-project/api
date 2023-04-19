import { Power, QuestionTopic, QuestionType } from "../enums";

// API
// auth
export interface LoginResp {
  token: string;
}

// tasks
export interface TaskResp {
  id: number;
  name: string;
  description: string;
  taskOrder: number;
  completed: boolean;
  blocked: boolean;
  comingSoon: boolean;
  thumbnailUrl: string;
  thumbnailAlt: string;
}

export interface TaskIntroResp {
  id: number;
  name: string;
  description: string;
  taskOrder: number;
  thumbnailUrl: string;
  thumbnailAlt: string;
  keywords: string[];
  longDescription: string;
}

interface ProgressBody {
  completed: boolean;
  blocked: boolean;
}

export interface TaskProgressResp {
  pretask: ProgressBody;
  duringtask: ProgressBody;
  postask: ProgressBody;
}

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

// teams
export interface TeamResp {
  id: number;
  code: string;
  name: string;
  taskOrder: number | null;
  students: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    power: Power | null;
  }[];
}

// SOCKETS
export interface StudentSocket {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  power: Power | null;
}

// SOCKETS
export interface StudentSocket {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  power: Power;
}

export type UserResp = Omit<StudentSocket, "power"> & {
  visualCondition?: string;
};
