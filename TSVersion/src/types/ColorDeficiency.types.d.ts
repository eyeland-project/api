import { Model, ForeignKey, DataTypes } from "sequelize";

export interface ColorDeficiency {
  id_color_deficiency: number;
  code: string;
  name: string;
  description: string;
}

export type ColorDeficiencyCreation = Omit<
  ColorDeficiency,
  "id_color_deficiency"
>;
