import {
  QuestionDuringtaskDetailDto,
  QuestionPostaskDetailDto,
  QuestionPretaskDetailDto
} from "@dto/teacher/question.dto";

interface Answer {
  id: number;
  idOption: number | null;
  answerSeconds: number | null;
  audioUrl: string | null;
  text: string | null;
  gradeAnswers: {
    id: number;
    grade: number;
    comment?: string | null;
  }[];
  team: {
    id: number;
    name: string;
  } | null;
}

export interface QuestionSubmissionDetailPretaskDto
  extends QuestionPretaskDetailDto {
  answers: Answer[];
}

export interface QuestionSubmissionDetailDuringtaskDto
  extends QuestionDuringtaskDetailDto {
  answers: Answer[];
}

export interface QuestionSubmissionDetailPostaskDto
  extends QuestionPostaskDetailDto {
  answers: Answer[];
}
