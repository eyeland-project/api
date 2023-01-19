// creating the model for the tasks table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Preguntas from "./Preguntas"
import { RespuestaModel } from '../types/Respuestas.types';

// model definition
const Respuestas = sequelize.define<RespuestaModel>('respuestas', {
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
    },
    id_pregunta: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
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