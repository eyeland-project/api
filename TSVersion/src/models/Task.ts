// creating the model for the Task table
// imports
import { DataTypes, Model } from "sequelize";
import sequelize from "../database/db";
import { Task, TaskCreation } from "../types/Task.types";

// model class definition
class TaskModel extends Model<Task, TaskCreation> {
  declare id_task: number;
  declare task_order: number;
  declare name: string;
  declare description: string;
  declare long_description?: string | null;
  declare keywords: string[];
  declare thumbnail_url?: string | null;
  declare thumbnail_alt?: string | null;
  declare coming_soon: boolean;
  declare deleted: boolean;
}

// model initialization
TaskModel.init(
  {
    id_task: {
      type: DataTypes.SMALLINT,
      autoIncrement: true,
      primaryKey: true
    },
    task_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    long_description: {
      type: DataTypes.STRING(1000)
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING(50)),
      allowNull: false,
      defaultValue: []
    },
    thumbnail_url: {
      type: DataTypes.STRING(2048)
    },
    thumbnail_alt: {
      type: DataTypes.STRING(50)
    },
    coming_soon: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "TaskModel",
    tableName: "task",
    timestamps: false
  }
);

export default TaskModel;
