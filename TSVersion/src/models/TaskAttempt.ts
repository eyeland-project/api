// creating the model for the TaskAttempt table
// imports
import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database';
import { TaskAttempt, TaskAttemptCreation } from '../types/database/TaskAttempt.types';
import Task from './Task';
import TeamModel from './Team';
import StudentModel from './Student';

// model class definition
class TaskAttemptModel extends Model<TaskAttempt, TaskAttemptCreation> {
    declare id_task_attempt: number;
    declare id_task: ForeignKey<number>;
    declare id_team?: ForeignKey<number>;
    declare id_student?: ForeignKey<number>;
    declare active: boolean;
    declare completed: boolean;
    declare start_time: Date;
    declare end_time?: Date;
}

// model initialization
TaskAttemptModel.init({
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
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    end_time: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    tableName: 'task_attempt',
    modelName: 'TaskAttemptModel',
    timestamps: false,
    hooks: {
        beforeCreate: async ({ id_team, id_student }: TaskAttemptModel) => {
            if (!id_student && !id_team) {
                throw new Error('Either id_student or id_team must be provided');
            }
        },
    },
});

// model associations
// task attempt and task
Task.hasMany(TaskAttemptModel, {
    foreignKey: 'id_task'
});
TaskAttemptModel.belongsTo(Task, {
    foreignKey: 'id_task'
});

// task attempt and team
TeamModel.hasMany(TaskAttemptModel, {
    foreignKey: 'id_team'
});
TaskAttemptModel.belongsTo(TeamModel, {
    foreignKey: {
        name: 'id_team',
        allowNull: true
    }
});

// task attempt and student
StudentModel.hasMany(TaskAttemptModel, {
    foreignKey: 'id_student'
});
TaskAttemptModel.belongsTo(StudentModel, {
    foreignKey: {
        name: 'id_student',
        allowNull: true
    }
});

export default TaskAttemptModel;
