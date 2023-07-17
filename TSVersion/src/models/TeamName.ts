// creating the model for the TeamName table
// imports
import { DataTypes, Model } from "sequelize";
import sequelize from "@database/db";
import { TeamName, TeamNameCreation } from "@interfaces/TeamName.types";

// model class definition
class TeamNameModel extends Model<TeamName, TeamNameCreation> {
  declare id_team_name: number;
  declare name: string;
}

// model initialization
TeamNameModel.init(
  {
    id_team_name: {
      type: DataTypes.SMALLINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "TeamNameModel",
    tableName: "team_name",
    timestamps: false
  }
);

export default TeamNameModel;
