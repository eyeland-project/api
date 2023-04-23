import {
  QuestionDuringtaskDetailDto as QuestionDuringtaskDetailDtoGlobal,
  QuestionPostaskDetailDto as QuestionPostaskDetailDtoGlobal,
  QuestionPretaskDetailDto as QuestionPretaskDetailDtoGlobal
} from "@dto/global/question.dto";

export type QuestionPretaskDetailDto = QuestionPretaskDetailDtoGlobal;

export interface QuestionDuringtaskDetailDto
  extends QuestionDuringtaskDetailDtoGlobal {}

export interface QuestionPostaskDetailDto
  extends QuestionPostaskDetailDtoGlobal {}
