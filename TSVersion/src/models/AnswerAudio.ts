// creating the model for the AnswerAudio table
// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { AnswerAudio, AnswerAudioCreation } from '../types/AnswerAudio.types';
import AnswerModel from './Answer';

// model class definition
class AnswerAudioModel extends Model<AnswerAudio, AnswerAudioCreation> {
    declare id_answer_audio: number;
    declare id_answer: number;
    declare topic: string;
    declare url: string;
}

// model initialization
AnswerAudioModel.init({
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
    modelName: 'AnswerAudioModel',
    tableName: 'answer_audio',
    timestamps: false
});

// definir la relación entre Respuestas y Respuestas de Audio
AnswerModel.hasMany(AnswerAudioModel, {
    foreignKey: 'id_answer'
});
AnswerAudioModel.belongsTo(AnswerModel, {
    foreignKey: 'id_answer'
});

export default AnswerAudioModel;
