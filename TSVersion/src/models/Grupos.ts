// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Estudiantes from './Estudiantes';
import { GrupoModel } from '../types/Grupos.types';

// model definition
const Grupos = sequelize.define<GrupoModel>('grupos', {
    id_grupo: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        // autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    availableTasks: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_estudiante1:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    id_estudiante2:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    id_estudiante3:{
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: false
});

// definir la relación entre Grupos y Estudiantes
Estudiantes.hasMany(Grupos, {
    foreignKey: {name: 'id_estudiante1', allowNull: true}
});
Grupos.belongsTo(Estudiantes, {
    foreignKey: {name: 'id_estudiante1', allowNull: true}
});

Estudiantes.hasMany(Grupos, {
    foreignKey: {name: 'id_estudiante2', allowNull: true}
});
Grupos.belongsTo(Estudiantes, {
    foreignKey: {name: 'id_estudiante2', allowNull: true}
});

Estudiantes.hasMany(Grupos, {
    foreignKey: {name: 'id_estudiante3', allowNull: true}
});
Grupos.belongsTo(Estudiantes, {
    foreignKey: {name: 'id_estudiante3', allowNull: true}
});

Grupos.hasOne(Estudiantes, {foreignKey: {name: "grupoactual", allowNull: true}});
Estudiantes.belongsTo(Grupos);

export default Grupos;
module.exports = Grupos;
