// imports
import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database/db';
import { Team, TeamCreation } from '../types/database/Team.types';
import CourseModel from './Course';

// model class definition
class TeamModel extends Model<Team, TeamCreation> {
    declare id_team: number;
    declare id_course: number;
    declare name: string;
    declare code?: string;
    declare active: boolean;
}

// model initialization
TeamModel.init({
    id_team: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_course: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
}, {
    sequelize,
    modelName: 'TeamModel',
    tableName: 'team',
    timestamps: false
});

// associations
// team and course
CourseModel.hasMany(TeamModel, {
    foreignKey: 'id_course'
});
TeamModel.belongsTo(CourseModel, {
    foreignKey: 'id_course'
});

export default TeamModel;
