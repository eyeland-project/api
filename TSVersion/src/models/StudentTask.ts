// imports
import { DataTypes, ForeignKey, Model } from "sequelize";
import sequelize from "@database/db";
import { TaskModel, StudentModel } from "@models";
import {
  StudentTask,
  StudentTaskCreation
} from "@interfaces/StudentTask.types";
import { ApiError } from "@middlewares/handleErrors";

// model class definition
class StudentTaskModel extends Model<StudentTask, StudentTaskCreation> {
  declare id_student_task: number;
  declare id_student: ForeignKey<number>;
  declare id_task: ForeignKey<number>;
  declare highest_stage: number;
}

// model initialization
StudentTaskModel.init(
  {
    id_student_task: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_student: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_task: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    highest_stage: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: "StudentTaskModel",
    tableName: "student_task",
    timestamps: false,
    hooks: {
      beforeUpdate: checkHighestStage,
      beforeCreate: checkHighestStage
    }
  }
);

function checkHighestStage({ highest_stage }: StudentTask) {
  if (highest_stage < 0 || highest_stage > 3)
    throw new ApiError("Invalid highest stage", 400);
}

// model associations
// student task and student
StudentModel.hasMany(StudentTaskModel, {
  foreignKey: "id_student",
  as: "studentTasks"
});
StudentTaskModel.belongsTo(StudentModel, {
  foreignKey: "id_student",
  as: "student"
});

// student task and task
TaskModel.hasMany(StudentTaskModel, {
  foreignKey: "id_task",
  as: "studentTasks"
});
StudentTaskModel.belongsTo(TaskModel, {
  foreignKey: "id_task",
  as: "task"
});

export default StudentTaskModel;
