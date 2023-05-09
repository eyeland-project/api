// creating the model for the Asnwer table
// imports
import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "@database/db";
import {
  GradeAnswer,
  GradeAnswerCreation
} from "@interfaces/GradeAnswer.types";
import { AnswerModel, TeacherModel } from "@models";

// model class definition
class GradeAnswerModel extends Model<GradeAnswer, GradeAnswerCreation> {
  declare id_grade_answer: number;
  declare id_answer: ForeignKey<number>;
  declare id_teacher: ForeignKey<number>;
  declare grade: number;
  declare comment?: string | null;

  declare answer: NonAttribute<AnswerModel>;
  declare teacher: NonAttribute<TeacherModel>;
}

// model initialization
GradeAnswerModel.init(
  {
    id_grade_answer: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_answer: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_teacher: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    comment: {
      type: DataTypes.STRING(2048)
    }
  },
  {
    sequelize,
    modelName: "GradeAnswerModel",
    tableName: "grade_answer",
    timestamps: false
  }
);

// model associations
// grade_answer and answer
GradeAnswerModel.belongsTo(AnswerModel, {
  foreignKey: "id_answer",
  as: "answer"
});
AnswerModel.hasMany(GradeAnswerModel, {
  foreignKey: "id_answer",
  as: "gradeAnswers"
});

// grade_answer and teacher
GradeAnswerModel.belongsTo(TeacherModel, {
  foreignKey: "id_teacher",
  as: "teacher"
});
TeacherModel.hasMany(GradeAnswerModel, {
  foreignKey: "id_teacher",
  as: "gradeAnswers"
});

export default GradeAnswerModel;
