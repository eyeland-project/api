// imports
import {
  DataTypes,
  Model,
  HasManyGetAssociationsMixin,
  NonAttribute
} from "sequelize";
import sequelize from "@database/db";
import { Team, TeamCreation } from "@interfaces/Team.types";
import {
  CourseModel,
  AnswerModel,
  TaskAttemptModel,
  TeamNameModel
} from "@models";
import { genTeamCode } from "@utils";

// model class definition
class TeamModel extends Model<Team, TeamCreation> {
  declare id_team: number;
  declare id_course: number;
  declare id_team_name?: number | null;
  declare name: string;
  declare code?: string | null;
  declare active: boolean;
  declare playing: boolean;

  declare getAnswers: HasManyGetAssociationsMixin<AnswerModel>;
  declare answers: NonAttribute<AnswerModel[]>;
  declare taskAttempts: NonAttribute<TaskAttemptModel[]>;
  declare course: NonAttribute<CourseModel>;
  declare teamName: NonAttribute<TeamNameModel>;
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
    id_team_name: {
      type: DataTypes.INTEGER
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
      afterCreate: async (team: TeamModel) => {
        team.code = genTeamCode(team.id_team);
        await team.save();
      }
    }
  }
);

// associations
// team and course
CourseModel.hasMany(TeamModel, {
  foreignKey: "id_course",
  as: "teams"
});
TeamModel.belongsTo(CourseModel, {
  foreignKey: "id_course",
  as: "course"
});

// team and team name
TeamNameModel.hasMany(TeamModel, {
  foreignKey: "id_team_name",
  as: "teams"
});
TeamModel.belongsTo(TeamNameModel, {
  foreignKey: "id_team_name",
  as: "teamName"
});

export default TeamModel;
