// creating the model for the VisualFieldDefect table
// imports
import { DataTypes, Model } from "sequelize";
import sequelize from "@database/db";
import {
  VisualFieldDefect,
  VisualFieldDefectCreation
} from "@interfaces/VisualFieldDefect.types";

class VisualFieldDefectModel extends Model<
  VisualFieldDefect,
  VisualFieldDefectCreation
> {
  declare id_visual_field_defect: number;
  declare code: string;
  declare name: string;
  declare description: string;
}

// model initialization
VisualFieldDefectModel.init(
  {
    id_visual_field_defect: {
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
    modelName: "VisualFieldDefectModel",
    tableName: "visual_field_defect",
    timestamps: false
  }
);

export default VisualFieldDefectModel;
