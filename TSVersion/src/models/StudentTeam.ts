// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Team from './Team';
import Student from './Student';
import { StudentTeamModel } from '../types/StudentTeam.types';

// model class definition
class StudentTeam extends Model implements StudentTeamModel {
    id_student_team!: number;
    id_student!: number;
    id_team!: number;
    power!: 'super_hearing' | 'memory_pro' | 'super_radar';
}

// model initialization
StudentTeam.init({
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
    modelName: 'StudentTeam',
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

// definir la relación entre StudentTeam y Student
Student.hasOne(StudentTeam, {
    foreignKey: 'id_student'
});
StudentTeam.hasOne(Student, {
    foreignKey: 'id_student'
});

// definir la relación entre StudentTeam y Team
Team.hasMany(StudentTeam, {
    foreignKey: 'id_team'
});
StudentTeam.hasOne(Team, {
    foreignKey: 'id_team'
});

export default StudentTeam;
module.exports = StudentTeam;
