// imports
const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Cursos = require('./Cursos');
// model definition
const Estudiantes = sequelize.define('estudiantes', {
    id_estudiante: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // grupoactual: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true
    // },
}, {
    timestamps: false
});

// definir la relación entre Cursos y Estudiantes
Cursos.hasMany(Estudiantes, {
    foreignKey: 'id_curso'
});
Estudiantes.belongsTo(Cursos, {
    foreignKey: 'id_curso'
});

module.exports = Estudiantes;
