import { Model, ForeignKey, DataTypes } from "sequelize";

export interface GradeAnswer {
  id_grade_answer: number;
  id_answer: ForeignKey<number>;
  id_teacher: ForeignKey<number>;
  grade: number;
  comment?: string | null;
}

export type GradeAnswerCreation = Omit<GradeAnswer, "id_grade_answer">;
