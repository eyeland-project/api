// creating the model for the AnswerAudio table
// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { AnswerAudioModel } from '../types/AnswerAudio.types';
import Answer from './Answer';

// model class definition
class AnswerAudio extends Model implements AnswerAudioModel {
    id_answer_audio!: number;
    id_answer!: number;
    topic!: string;
    url!: string;
}

// model initialization
AnswerAudio.init({
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
    sequelize,
    modelName: 'AnswerAudio',
    tableName: 'answer_audio',
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
