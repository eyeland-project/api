// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import TaskModel from './Task';
import StudentModel from './Student';
import { StudentTask, StudentTaskCreation } from '../types/StudentTask.types';

// model class definition
class StudentTaskModel extends Model<StudentTask, StudentTaskCreation> {
    declare id_student_task: number;
    declare id_student: number;
    declare id_task: number;
    declare completed: boolean;
}

// model initialization
StudentTaskModel.init({
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
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'StudentTaskModel',
    tableName: 'student_task',
    timestamps: false,
});

// definir la relación entre StudentTask y Student
StudentModel.hasMany(StudentTaskModel, {
    foreignKey: 'id_student'
});
StudentTaskModel.belongsTo(StudentModel, {
    foreignKey: 'id_student'
});

// definir la relación entre StudentTask y Team
TaskModel.hasMany(StudentTaskModel, {
    foreignKey: 'id_team'
});
StudentTaskModel.belongsTo(TaskModel, {
    foreignKey: 'id_team'
});

export default StudentTaskModel;
