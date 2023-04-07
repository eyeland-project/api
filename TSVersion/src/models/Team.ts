// imports
import {
  DataTypes,
  Model,
  HasManyGetAssociationsMixin,
  NonAttribute
} from "sequelize";
import sequelize from "../database/db";
import { Team, TeamCreation } from "../types/Team.types";
import CourseModel from "./Course";
import { AnswerModel, TaskAttemptModel } from "./";
import { genTeamCode } from "../utils";

// model class definition
class TeamModel extends Model<Team, TeamCreation> {
  declare id_team: number;
  declare id_course: number;
  declare name: string;
  declare code?: string | null;
  declare active: boolean;
  declare playing: boolean;
  declare getAnswers: HasManyGetAssociationsMixin<AnswerModel>;
  declare answers: NonAttribute<AnswerModel[]>;
  declare taskAttempts: NonAttribute<TaskAttemptModel[]>;
}

// model initialization
TeamModel.init(
  {
    id_team: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_course: {
      type: DataTypes.INTEGER,
      allowNull: false
      // references: {
      //     model: 'course',
      //     key: 'id_course'
      // }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(6)
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    playing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "TeamModel",
    tableName: "team",
    timestamps: false,
    hooks: {
      beforeCreate: async (team: TeamModel) => {
        team.code = genTeamCode();
      }
    }
  }
);

// associations
// team and course
CourseModel.hasMany(TeamModel, {
  foreignKey: "id_course"
});
TeamModel.belongsTo(CourseModel, {
  foreignKey: "id_course"
});

export default TeamModel;
