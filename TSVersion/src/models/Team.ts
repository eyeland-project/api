// imports
import {
  DataTypes,
  Model,
  HasManyGetAssociationsMixin,
  NonAttribute
} from "sequelize";
import sequelize from "@database/db";
import { Team, TeamCreation } from "@interfaces/Team.types";
import { CourseModel, AnswerModel, TaskAttemptModel } from "@models";
import { genTeamCode } from "@utils";

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
  declare course: NonAttribute<CourseModel>;
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
  foreignKey: "id_course"
});
TeamModel.belongsTo(CourseModel, {
  foreignKey: "id_course",
  as: "course"
});

export default TeamModel;
