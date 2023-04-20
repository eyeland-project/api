// imports
import { DataTypes, Model } from "sequelize";
import sequelize from "@database/db";
import {
  Institution,
  InstitutionCreation
} from "@interfaces/Institution.types";

// model class definition
class InstitutionModel extends Model<Institution, InstitutionCreation> {
  declare id_institution: number;
  declare name: string;
  declare nit: string;
  declare address: string;
  declare city: string;
  declare country: string;
  declare phone_code: string;
  declare phone_number: string;
  declare email: string;
  declare website_url?: string | null;
}

// model initialization
InstitutionModel.init(
  {
    id_institution: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    nit: {
      type: DataTypes.STRING(9),
      allowNull: false,
      unique: true
    },
    address: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone_code: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: false
    },
    website_url: {
      type: DataTypes.STRING(2048)
    }
  },
  {
    sequelize,
    modelName: "InstitutionModel",
    tableName: "institution",
    timestamps: false
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['nit']
    //     }
    // ]
  }
);

export default InstitutionModel;
