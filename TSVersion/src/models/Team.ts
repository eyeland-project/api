// imports
import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database/db';
import { Team, TeamCreation } from '../types/database/Team.types';

// model class definition
class TeamModel extends Model<Team, TeamCreation> {
    declare id_team: number;
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

// definir la relación entre Grupos y Estudiantes
// Team.hasOne(Student, { foreignKey: { name: "grupoactual", allowNull: true } });
// Student.belongsTo(Team);

export default TeamModel;
