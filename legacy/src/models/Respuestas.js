// creating the model for the tasks table
// imports
const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Preguntas = require("./Preguntas")

// model definition
const Respuestas = sequelize.define('respuestas', {
    id_respuesta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    contenido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correcta: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    timestamps: false
});

Preguntas.hasMany(Respuestas, {
    foreignKey: 'id_pregunta'
    });
Respuestas.belongsTo(Preguntas, {
    foreignKey: 'id_pregunta'
    });

module.exports = Respuestas;