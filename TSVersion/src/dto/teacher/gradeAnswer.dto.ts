export interface GradeAnswerCreateDto {
  grade: number;
  comment?: string | null;
}

export type GradeAnswerUpdateDto = Partial<
  Omit<GradeAnswerCreateDto, "idAnswer">
>;
