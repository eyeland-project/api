// creating the model for the Option table
// imports
import { DataTypes, ForeignKey, Model } from "sequelize";
import sequelize from "../database/db";
import { Option, OptionCreation } from "../types/Option.types";
import QuestionModel from "./Question";

// model class definition
class OptionModel extends Model<Option, OptionCreation> {
  declare id_option: number;
  declare id_question: ForeignKey<number>;
  declare feedback?: string | null;
  declare content: string;
  declare correct: boolean;
  declare deleted: boolean;
}

// model initialization
OptionModel.init(
  {
    id_option: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_question: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    feedback: {
      type: DataTypes.STRING(100)
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "OptionModel",
    tableName: "option",
    timestamps: false
  }
);

// model associations
// option and question
QuestionModel.hasMany(OptionModel, {
  foreignKey: "id_question"
});
OptionModel.belongsTo(QuestionModel, {
  foreignKey: "id_question"
});

export default OptionModel;
