import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "../database/db";
import TaskStageModel from "./TaskStage";
import { Question, QuestionCreation } from "../types/Question.types";
import { ApiError } from "../middlewares/handleErrors";

// model class definition
class QuestionModel extends Model<Question, QuestionCreation> {
  declare id_question: number;
  declare id_task_stage: ForeignKey<number>;
  declare question_order: number;
  declare content: string;
  declare audio_url?: string | null;
  declare video_url?: string | null;
  declare type: string;
  declare img_alt?: string | null;
  declare img_url?: string | null;
  declare deleted: boolean;

  declare stage: NonAttribute<TaskStageModel>;
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
  },
  {
    sequelize,
    modelName: "QuestionModel",
    tableName: "question",
    timestamps: false,
    hooks: {
      beforeCreate: async ({ type }: QuestionModel) => {
        if (type !== "select" && type !== "audio") {
          throw new ApiError(
            "Type must be one of the following values: select, audio",
            400
          );
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
  foreignKey: "id_task_stage"
});
QuestionModel.belongsTo(TaskStageModel, {
  foreignKey: "id_task_stage",
  as: "stage"
});

export default QuestionModel;
