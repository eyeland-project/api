// creating the model for the Task table
// imports
import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "@database/db";
import { TaskStage, TaskStageCreation } from "@interfaces/TaskStage.types";
import { TaskModel, QuestionGroupModel } from "@models";
import { TaskStageMechanics } from "@interfaces/enums/taskStage.enum";
import { ApiError } from "@middlewares/handleErrors";

// model class definition
class TaskStageModel extends Model<TaskStage, TaskStageCreation> {
  declare id_task_stage: number;
  declare id_task: ForeignKey<number>;
  declare task_stage_order: number;
  declare description: string;
  declare keywords: string[];
  declare mechanics?: TaskStageMechanics[] | null;

  declare task: NonAttribute<TaskModel>;
  declare questionGroups: NonAttribute<QuestionGroupModel[]>;
}

// model initialization
TaskStageModel.init(
  {
    id_task_stage: {
      type: DataTypes.SMALLINT,
      autoIncrement: true,
      primaryKey: true
    },
    id_task: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    task_stage_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING(50)),
      allowNull: false,
      defaultValue: []
    },
    mechanics: {
      // type: DataTypes.ARRAY(
      //   DataTypes.ENUM(...Object.values(TaskStageMechanics))
      // ),
      type: DataTypes.ENUM(...Object.values(TaskStageMechanics)),
      allowNull: true,
      defaultValue: null
    }
  },
  {
    sequelize,
    modelName: "TaskStageModel",
    tableName: "task_stage",
    timestamps: false,
    hooks: {
      beforeCreate: async ({ mechanics }: TaskStageModel) => {
        if (!mechanics) return;
        const mechanicsValues = Object.values(TaskStageMechanics);
        for (let i = 0; i < mechanicsValues.length; i++) {
          if (mechanicsValues.indexOf(mechanics[i]) === -1) {
            throw new ApiError(
              "Type must be one of the following values: " +
                mechanicsValues.join(", "),
              400
            );
          }
        }
      }
    }
  }
);

// model associations
// task stage and task
TaskModel.hasMany(TaskStageModel, {
  foreignKey: "id_task",
  as: "taskStages"
});
TaskStageModel.belongsTo(TaskModel, {
  foreignKey: "id_task",
  as: "task"
});

export default TaskStageModel;
