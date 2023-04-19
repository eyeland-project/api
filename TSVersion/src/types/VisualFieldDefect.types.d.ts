import { Model, ForeignKey, DataTypes } from "sequelize";

export interface VisualFieldDefect {
  id_visual_field_defect: number;
  code: string;
  name: string;
  description: string;
}

export type VisualFieldDefectCreation = Omit<
  VisualFieldDefect,
  "id_visual_field_defect"
>;
