// creating the model for the tasks table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Preguntas from "./Preguntas"

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

export default Respuestas;
module.exports = Respuestas;