// creating the model for the Release table
// imports
import { DataTypes, Model } from "sequelize";
import sequelize from "../database/db";
import { Release, ReleaseCreation } from "../types/Release.types";

// model class definition
class ReleaseModel extends Model<Release, ReleaseCreation> {
  declare id_release: number;
  declare version: string;
  declare url: string;
  declare active: boolean;
  declare created_at: Date;
}

// model initialization
ReleaseModel.init(
  {
    id_release: {
      type: DataTypes.SMALLINT,
      autoIncrement: true,
      primaryKey: true
    },
    version: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(2048),
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: "ReleaseModel",
    tableName: "release",
    timestamps: false
  }
);

export default ReleaseModel;
