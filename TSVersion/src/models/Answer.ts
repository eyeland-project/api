// creating the model for the Asnwer table
// imports
import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "@database/db";
import { Answer, AnswerCreation } from "@interfaces/Answer.types";
import {
  QuestionModel,
  OptionModel,
  TaskAttemptModel,
  TeamModel
} from "@models";

// model class definition
class AnswerModel extends Model<Answer, AnswerCreation> {
  declare id_answer: number;
  declare id_question: ForeignKey<number>;
  declare id_option?: ForeignKey<number> | null;
  declare id_task_attempt: ForeignKey<number>;
  declare id_team?: ForeignKey<number> | null;
  declare answer_seconds?: number | null;
  declare audio_url?: string | null;

  declare question: NonAttribute<QuestionModel>;
  declare option: NonAttribute<OptionModel>;
}

// model initialization
AnswerModel.init(
  {
    id_answer: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_question: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_option: {
      type: DataTypes.INTEGER
    },
    id_task_attempt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_team: {
      type: DataTypes.INTEGER
    },
    answer_seconds: {
      type: DataTypes.INTEGER
    },
    audio_url: {
      type: DataTypes.STRING(2048)
    }
  },
  {
    sequelize,
    modelName: "AnswerModel",
    tableName: "answer",
    timestamps: false
  }
);

// model associations
// answer and question
QuestionModel.hasMany(AnswerModel, {
  foreignKey: "id_question"
});
AnswerModel.belongsTo(QuestionModel, {
  foreignKey: "id_question",
  as: "question"
});

// answer and option
OptionModel.hasMany(AnswerModel, {
  foreignKey: "id_option"
});
AnswerModel.belongsTo(OptionModel, {
  foreignKey: "id_option",
  as: "option"
});

// answer and task attempt
TaskAttemptModel.hasMany(AnswerModel, {
  foreignKey: "id_task_attempt"
});
AnswerModel.belongsTo(TaskAttemptModel, {
  foreignKey: "id_task_attempt"
});

// answer and team
TeamModel.hasMany(AnswerModel, {
  foreignKey: "id_team",
  as: "answers"
});
AnswerModel.belongsTo(TeamModel, {
  foreignKey: {
    name: "id_team",
    allowNull: true
  }
});

export default AnswerModel;
