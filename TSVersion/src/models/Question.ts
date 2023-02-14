import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database/db';
import TaskStageModel from "./TaskStage"
import { Question, QuestionCreation } from '../types/database/Question.types';

// model class definition
class QuestionModel extends Model<Question, QuestionCreation> {
    declare id_question: number;
    declare id_task_stage: ForeignKey<number>;
    declare question_order: number;
    declare content: string;
    declare audio_url?: string;
    declare video_url?: string;
    declare type: string;
    declare img_alt?: string;
    declare img_url?: string;
    declare deleted: boolean;
}

// model initialization
QuestionModel.init({
    id_question: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_task_stage: {
        type: DataTypes.INTEGER,
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
    modelName: 'QuestionModel',
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

// model associations
// question and task stage
TaskStageModel.hasMany(QuestionModel, {
    foreignKey: 'id_task_stage'
});
QuestionModel.belongsTo(TaskStageModel, {
    foreignKey: 'id_task_stage'
});

export default QuestionModel;
