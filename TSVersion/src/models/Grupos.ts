// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Estudiantes from './Estudiantes';

// model definition
const Grupos = sequelize.define('grupos', {
    id_grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
}, {
    timestamps: false
});

// definir la relación entre Grupos y Estudiantes
Estudiantes.hasMany(Grupos, {
    foreignKey: 'id_estudiante1'
});
Grupos.belongsTo(Estudiantes, {
    foreignKey: 'id_estudiante1'
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
