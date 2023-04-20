import { Model, ForeignKey, DataTypes } from "sequelize";

export interface BlindnessAcuity {
  id_blindness_acuity: number;
  code: string;
  name: string;
  level: number;
  worse_than?: string | null;
  better_eq_than?: string | null;
}

export type BlindnessAcuityCreation = Omit<
  BlindnessAcuity,
  "id_blindness_acuity"
>;
