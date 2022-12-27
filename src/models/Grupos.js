// imports
const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Estudiantes = require('./Estudiantes');

// model definition
const Grupos = sequelize.define('grupos', {
    id_grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    foreignKey: 'id_estudiante2'
});
Grupos.belongsTo(Estudiantes, {
    foreignKey: 'id_estudiante2'
});

Estudiantes.hasMany(Grupos, {
    foreignKey: 'id_estudiante3'
});
Grupos.belongsTo(Estudiantes, {
    foreignKey: 'id_estudiante3'
});

module.exports = Grupos;
