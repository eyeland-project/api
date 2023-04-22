// creating the model for the Task table
// imports
import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "@database/db";
import { TaskStage, TaskStageCreation } from "@interfaces/TaskStage.types";
import { TaskModel } from "@models";

// model class definition
class TaskStageModel extends Model<TaskStage, TaskStageCreation> {
  declare id_task_stage: number;
  declare id_task: ForeignKey<number>;
  declare task_stage_order: number;
  declare description: string;
  declare keywords: string[];
  declare task: NonAttribute<TaskModel>;
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
    }
  },
  {
    sequelize,
    modelName: "TaskStageModel",
    tableName: "task_stage",
    timestamps: false
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
