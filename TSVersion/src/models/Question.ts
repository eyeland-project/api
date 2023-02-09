import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Task from "./Task"
import { QuestionModel } from '../types/Question.types';

// model class definition
class Question extends Model implements QuestionModel {
    id_question!: number;
    id_task!: number;
    content!: string;
    audio_url!: string;
    video_url!: string;
    type!: string;
    question_order!: number;
    img_alt!: string;
    img_url!: string;
    deleted!: boolean;
}

// model initialization
Question.init({
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
    sequelize,
    modelName: 'Question',
    tableName: 'question',
    timestamps: false,
    hooks: {
        beforeCreate: async ({ type }: QuestionModel) => {
            if (type !== 'select' && type !== 'audio') {
                throw new Error('type must be one of the following values: select, audio');
            }
        },
    },
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['id_task', 'question_order']
    //     }
    // ]
});

Task.hasMany(Question, {
    foreignKey: 'id_task'
});

Question.belongsTo(Task, {
    foreignKey: 'id_task'
});

export default Question;
module.exports = Question;
