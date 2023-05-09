export interface GradeAnswerCreateDto {
  idAnswer: number;
  idTeacher: number;
  grade: number;
  comment?: string | null;
}

export type GradeAnswerUpdateDto = Partial<
  Omit<GradeAnswerCreateDto, "idAnswer">
>;
