// creating the model for the Asnwer table
// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { AnswerModel } from '../types/Answer.types';
import Question from './Question';
import Option from './Option';
import TaskAttempt from './TaskAttempt';

// model class definition
class Answer extends Model implements AnswerModel {
    declare id_answer: number;
    declare id_question: number;
    declare id_option: number;
    declare id_task_attempt: number;
    declare count: number;
    declare start_time: Date;
    declare end_time: Date;
}

// model initialization
Answer.init({
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
    count: {
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
    modelName: 'Answer',
    tableName: 'answer',
    timestamps: false,
});

// definir la relación entre Preguntas y Respuestas
Question.hasMany(Answer, {
    foreignKey: 'id_question'
});
Answer.belongsTo(Question, {
    foreignKey: 'id_question'
});

// definir la relación entre Opciones y Respuestas
Option.hasMany(Answer, {
    foreignKey: 'id_option'
});
Answer.belongsTo(Option, {
    foreignKey: 'id_option'
});

// definir la relación entre Intentos de Tareas y Respuestas
TaskAttempt.hasMany(Answer, {
    foreignKey: 'id_task_attempt'
});
Answer.belongsTo(TaskAttempt, {
    foreignKey: 'id_task_attempt'
});

export default Answer;
module.exports = Answer;
