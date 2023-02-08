// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import { TeamModel } from '../types/Team.types';

// model definition
const Team = sequelize.define<TeamModel>('team', {
    id_team: {
        type: DataTypes.INTEGER.UNSIGNED.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    id_course: {
        type: DataTypes.INTEGER.UNSIGNED.UNSIGNED,
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
    timestamps: false
});

// definir la relación entre Grupos y Estudiantes
// Team.hasOne(Student, { foreignKey: { name: "grupoactual", allowNull: true } });
// Student.belongsTo(Team);

export default Team;
module.exports = Team;
