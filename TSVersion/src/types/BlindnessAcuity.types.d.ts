import { Model, ForeignKey, DataTypes } from "sequelize";

export interface BlindnessAcuity {
  id_blindness_acuity: number;
  name: string;
  level: number;
  description: string;
}

export type BlindnessAcuityCreation = Omit<
  BlindnessAcuity,
  "id_blindness_acuity"
>;
