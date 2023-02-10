// creating the model for the Asnwer table
// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { Answer, AnswerCreation } from '../types/Answer.types';
import QuestionModel from './Question';
import OptionModel from './Option';
import TaskAttemptModel from './TaskAttempt';

// model class definition
class AnswerModel extends Model<Answer, AnswerCreation> {
    declare id_answer: number;
    declare id_question: number;
    declare id_option: number;
    declare id_task_attempt: number;
    declare start_time: Date;
    declare end_time: Date;
}

// model initialization
AnswerModel.init({
    id_answer: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_question: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_option: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_task_attempt: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    start_time: {
        type: DataTypes.DATE
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
}, {
    sequelize,
    modelName: 'AnswerModel',
    tableName: 'answer',
    timestamps: false,
});

// definir la relación entre Preguntas y Respuestas
QuestionModel.hasMany(AnswerModel, {
    foreignKey: 'id_question'
});
AnswerModel.belongsTo(QuestionModel, {
    foreignKey: 'id_question'
});

// definir la relación entre Opciones y Respuestas
OptionModel.hasMany(AnswerModel, {
    foreignKey: 'id_option'
});
AnswerModel.belongsTo(OptionModel, {
    foreignKey: 'id_option'
});

// definir la relación entre Intentos de Tareas y Respuestas
TaskAttemptModel.hasMany(AnswerModel, {
    foreignKey: 'id_task_attempt'
});
AnswerModel.belongsTo(TaskAttemptModel, {
    foreignKey: 'id_task_attempt'
});

export default AnswerModel;
