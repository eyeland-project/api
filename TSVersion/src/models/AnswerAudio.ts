// creating the model for the AnswerAudio table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import { AnswerAudioModel } from '../types/AnswerAudio.types';
import Answer from './Answer';

// model definition
const AnswerAudio = sequelize.define<AnswerAudioModel>('answer_audio', {
    id_answer_audio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_answer: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    topic: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING(2048),
        allowNull: false
    }
}, {
    timestamps: false
});

// definir la relación entre Respuestas y Respuestas de Audio
Answer.hasMany(AnswerAudio, {
    foreignKey: 'id_answer'
});
AnswerAudio.belongsTo(Answer, {
    foreignKey: 'id_answer'
});

export default AnswerAudio;
module.exports = AnswerAudio;
