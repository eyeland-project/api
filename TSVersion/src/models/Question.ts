import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Task from "./Task"
import { QuestionModel } from '../types/Question.types';

// model definition
const Question = sequelize.define<QuestionModel>('question', {
    id_question: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_task: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    audio_url: {
        type: DataTypes.STRING(2048)
    },
    video_url: {
        type: DataTypes.STRING(2048)
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    question_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    img_alt: {
        type: DataTypes.STRING(50)
    },
    img_url: {
        type: DataTypes.STRING(2048)
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: false,
    hooks: {
        beforeCreate: async ({ type }: QuestionModel) => {
            if (type !== 'select' && type !== 'audio') {
                throw new Error('type must be one of the following values: select, audio');
            }
        },
    },
    indexes: [
        {
            unique: true,
            fields: ['id_task', 'question_order']
        }
    ]
});

Task.hasMany(Question, {
    foreignKey: 'id_task'
});

Question.belongsTo(Task, {
    foreignKey: 'id_task'
});

export default Question;
module.exports = Question;
