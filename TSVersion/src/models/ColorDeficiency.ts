// creating the model for the ColorDeficiency table
// imports
import { DataTypes, Model } from "sequelize";
import sequelize from "../database/db";
import {
  ColorDeficiency,
  ColorDeficiencyCreation
} from "../types/ColorDeficiency.types";

class ColorDeficiencyModel extends Model<
  ColorDeficiency,
  ColorDeficiencyCreation
> {
  declare id_color_deficiency: number;
  declare code: string;
  declare name: string;
  declare description: string;
}

// model initialization
ColorDeficiencyModel.init(
  {
    id_color_deficiency: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "ColorDeficiencyModel",
    tableName: "color_deficiency",
    timestamps: false
  }
);

export default ColorDeficiencyModel;
