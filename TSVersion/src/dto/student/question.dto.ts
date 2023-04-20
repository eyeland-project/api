import {
  QuestionDuringtaskDetailDto as QuestionDuringtaskDetailDtoGlobal,
  QuestionPostaskDetailDto as QuestionPostaskDetailRespGlobal,
  QuestionPretaskDetailDto as QuestionPretaskDetailDtoGlobal
} from "@dto/global/question.dto";

export type QuestionPretaskDetailDto = QuestionPretaskDetailDtoGlobal;

export interface QuestionDuringtaskDetailDto
  extends QuestionDuringtaskDetailDtoGlobal {}

export interface QuestionPostaskDetailResp
  extends QuestionPostaskDetailRespGlobal {}
