import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "@database/db";
import { Question, QuestionCreation } from "@interfaces/Question.types";
import { ApiError } from "@middlewares/handleErrors";
import {
  QuestionCharacter,
  QuestionTopic,
  QuestionType
} from "@interfaces/enums/question.enum";
import { AnswerModel, OptionModel, TaskStageModel } from "@models";

// model class definition
class QuestionModel extends Model<Question, QuestionCreation> {
  declare id_question: number;
  declare id_task_stage: ForeignKey<number>;
  declare question_order: number;
  declare content: string;
  declare audio_url?: string | null;
  declare video_url?: string | null;
  declare type: QuestionType;
  declare img_alt?: string | null;
  declare img_url?: string | null;
  declare topic?: QuestionTopic | null;
  declare hint?: string | null;
  declare character?: QuestionCharacter | null;
  declare deleted: boolean;

  declare taskStage: NonAttribute<TaskStageModel>;
  declare options: NonAttribute<OptionModel[]>;
  declare answers: NonAttribute<AnswerModel[]>;
}

// model initialization
QuestionModel.init(
  {
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
      type: DataTypes.STRING(400),
      allowNull: false
    },
    audio_url: {
      type: DataTypes.STRING(2048)
    },
    video_url: {
      type: DataTypes.STRING(2048)
    },
    type: {
      type: DataTypes.ENUM(...Object.values(QuestionType)),
      allowNull: false
    },
    question_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    img_alt: {
      type: DataTypes.STRING(200)
    },
    img_url: {
      type: DataTypes.STRING(2048)
    },
    topic: {
      type: DataTypes.ENUM(...Object.values(QuestionTopic))
    },
    character: {
      type: DataTypes.ENUM(...Object.values(QuestionCharacter))
    },
    hint: {
      type: DataTypes.STRING(200)
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "QuestionModel",
    tableName: "question",
    timestamps: false,
    hooks: {
      beforeCreate: async ({ type, topic }: QuestionModel) => {
        const typeValues = Object.values(QuestionType);
        if (typeValues.indexOf(type) === -1) {
          throw new ApiError(
            "Type must be one of the following values: " +
              typeValues.join(", "),
            400
          );
        }
        if (topic) {
          const topicValues = Object.values(QuestionTopic);
          if (topicValues.indexOf(topic) === -1) {
            throw new ApiError(
              "Topic must be one of the following values: " +
                topicValues.join(", "),
              400
            );
          }
        }
      }
    }
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['id_task', 'question_order']
    //     }
    // ]
  }
);

// model associations
// question and task stage
TaskStageModel.hasMany(QuestionModel, {
  foreignKey: "id_task_stage",
  as: "questions"
});
QuestionModel.belongsTo(TaskStageModel, {
  foreignKey: "id_task_stage",
  as: "taskStage"
});

export default QuestionModel;
