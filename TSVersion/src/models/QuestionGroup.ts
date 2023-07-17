import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "@database/db";
import {
  QuestionGroup,
  QuestionGroupCreation
} from "@interfaces/QuestionGroup.types";
import { TeamNameModel, QuestionModel } from "@models";

// model class definition
class QuestionGroupModel extends Model<QuestionGroup, QuestionGroupCreation> {
  declare id_question_group: number;
  declare id_team_name?: ForeignKey<number> | null;

  declare teamName?: NonAttribute<TeamNameModel> | null;
  declare questions: NonAttribute<QuestionModel[]>;
}

// model initialization
QuestionGroupModel.init(
  {
    id_question_group: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_team_name: {
      type: DataTypes.SMALLINT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "QuestionGroupModel",
    tableName: "question_group",
    timestamps: false
  }
);

// model associations
// question group and task stage
TeamNameModel.hasMany(QuestionGroupModel, {
  foreignKey: "id_team_name",
  as: "questionGroups"
});
QuestionGroupModel.belongsTo(TeamNameModel, {
  foreignKey: "id_team_name",
  as: "teamName"
});

export default QuestionGroupModel;
