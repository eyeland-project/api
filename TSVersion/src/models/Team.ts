// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { TeamModel } from '../types/Team.types';

// model definition
// const Team = sequelize.define<TeamModel>('team', {
//     id_team: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     id_course: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//     },
//     name: {
//         type: DataTypes.STRING(50),
//         allowNull: false
//     },
//     code: {
//         type: DataTypes.STRING(6)
//     },
//     active: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: true
//     },
// }, {
//     timestamps: false
// });

// model class definition
class Team extends Model implements TeamModel {
    id_team!: number;
    id_course!: number;
    name!: string;
    code!: string;
    active!: boolean;
}

// model initialization
Team.init({
    id_team: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_course: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    modelName: 'Team',
    tableName: 'team',
    timestamps: false
});

// definir la relación entre Grupos y Estudiantes
// Team.hasOne(Student, { foreignKey: { name: "grupoactual", allowNull: true } });
// Student.belongsTo(Team);

export default Team;
module.exports = Team;
