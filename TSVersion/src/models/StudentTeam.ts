// imports
import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database';
import TeamModel from './Team';
import StudentModel from './Student';
import { StudentTeam, StudentTeamCreation } from '../types/database/StudentTeam.types';

// model class definition
class StudentTeamModel extends Model<StudentTeam, StudentTeamCreation> {
    declare id_student_team: number;
    declare id_student: ForeignKey<number>;
    declare id_team: ForeignKey<number>;
    declare power: 'super_hearing' | 'memory_pro' | 'super_radar';
}

// model initialization
StudentTeamModel.init({
    id_student_team: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_student: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_team: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    power: {
        type: DataTypes.STRING(20),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'StudentTeamModel',
    tableName: 'student_team',
    timestamps: false,
    hooks: {
        beforeCreate: async ({ power }: StudentTeamModel) => {
            if (power !== 'super_hearing' && power !== 'memory_pro' && power !== 'super_radar') {
                throw new Error('power must be one of the following values: super_hearing, memory_pro, super_radar');
            }
        },
    }
});

// model associations
// student team and student
StudentModel.hasOne(StudentTeamModel, {
    foreignKey: 'id_student'
});
StudentTeamModel.belongsTo(StudentModel, {
    foreignKey: 'id_student'
});

// student team and team
TeamModel.hasMany(StudentTeamModel, {
    foreignKey: 'id_team'
});
StudentTeamModel.belongsTo(TeamModel, {
    foreignKey: 'id_team'
});

export default StudentTeamModel;
