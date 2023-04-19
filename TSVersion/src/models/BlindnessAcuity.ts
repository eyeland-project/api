// creating the model for the BlindnessAcuity table
// imports
import { DataTypes, Model } from "sequelize";
import sequelize from "../database/db";
import {
  BlindnessAcuity,
  BlindnessAcuityCreation
} from "../types/BlindnessAcuity.types";

class BlindnessAcuityModel extends Model<
  BlindnessAcuity,
  BlindnessAcuityCreation
> {
  declare id_blindness_acuity: number;
  declare code: string;
  declare name: string;
  declare level: number;
  declare worse_than?: string | null;
  declare better_eq_than?: string | null;
}

// model initialization
BlindnessAcuityModel.init(
  {
    id_blindness_acuity: {
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
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    worse_than: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    better_eq_than: {
      type: DataTypes.STRING(200),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "BlindnessAcuityModel",
    tableName: "blindness_acuity",
    timestamps: false
  }
);

export default BlindnessAcuityModel;
