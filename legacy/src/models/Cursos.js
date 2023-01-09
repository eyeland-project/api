// imports
const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Instituciones = require('./Instituciones');
const Profesores = require('./Profesores');

// model definition
const Cursos = sequelize.define('cursos', {
    id_curso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: false
});

// definir la relación entre Profesores y Cursos
Profesores.hasMany(Cursos, {
    foreignKey: 'id_profesor'
});
Cursos.belongsTo(Profesores, {
    foreignKey: 'id_profesor'
});

// definir la relación entre Instituciones y Cursos
Instituciones.hasMany(Cursos, {
    foreignKey: 'id_institucion'
});
Cursos.belongsTo(Instituciones, {
    foreignKey: 'id_institucion'
});

module.exports = Cursos;
