import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Tasks from "./Tasks"
import { PreguntaModel } from '../types/Preguntas.types';

// model definition
const Preguntas = sequelize.define<PreguntaModel>('preguntas', {
    id_pregunta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pregunta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    audio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    video: {
        type: DataTypes.STRING,
        allowNull: true
    },
    retroalimentacion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    examen: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_task: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    timestamps: false,
    indexes: [
        {
        unique: true,
        fields: ['id_task', 'orden', 'examen']
        }
    ]
});

Tasks.hasMany(Preguntas, {
    foreignKey: 'id_task'
});
Preguntas.belongsTo(Tasks, {
    foreignKey: 'id_task'
});

export default Preguntas;
module.exports = Preguntas;