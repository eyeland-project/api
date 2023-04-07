// creating the model for the TaskAttempt table
// imports
import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "../database/db";
import { TaskAttempt, TaskAttemptCreation } from "../types/TaskAttempt.types";
import TaskModel from "./Task";
import TeamModel from "./Team";
import StudentModel from "./Student";
import { ApiError } from "../middlewares/handleErrors";
import { Power } from "../types/enums";

// model class definition
class TaskAttemptModel extends Model<TaskAttempt, TaskAttemptCreation> {
  declare id_task_attempt: number;
  declare id_task: ForeignKey<number>;
  declare id_team?: ForeignKey<number> | null;
  declare id_student: ForeignKey<number>;
  declare power?: Power | null;
  declare active: boolean;
  declare time_stamp: Date;
  declare task: NonAttribute<TaskModel>;
  declare student: NonAttribute<StudentModel>;
}

// model initialization
TaskAttemptModel.init(
  {
    id_task_attempt: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_task: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    id_team: {
      type: DataTypes.INTEGER
    },
    id_student: {
      type: DataTypes.INTEGER
    },
    power: {
      type: DataTypes.STRING(20)
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    time_stamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "task_attempt",
    modelName: "TaskAttemptModel",
    timestamps: false,
    hooks: {
      beforeUpdate: checkPower,
      beforeCreate: checkPower
    }
  }
);

function checkPower({ power }: TaskAttemptModel) {
  if (power !== undefined && power !== null) {
    if (!Object.values(Power).includes(power))
      throw new ApiError(
        "Power must be one of the following values: super_hearing, memory_pro, super_radar",
        400
      );
  }
}

// model associations
// task attempt and task
TaskModel.hasMany(TaskAttemptModel, {
  foreignKey: "id_task"
});
TaskAttemptModel.belongsTo(TaskModel, {
  foreignKey: "id_task",
  as: "task"
});

// task attempt and team
TeamModel.hasMany(TaskAttemptModel, {
  foreignKey: "id_team",
  as: "taskAttempts"
});
TaskAttemptModel.belongsTo(TeamModel, {
  foreignKey: {
    name: "id_team",
    allowNull: true
  }
});

// task attempt and student
StudentModel.hasMany(TaskAttemptModel, {
  foreignKey: "id_student"
});
TaskAttemptModel.belongsTo(StudentModel, {
  foreignKey: "id_student",
  as: "student"
});

export default TaskAttemptModel;
