// creating the model for the TaskAttempt table
// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { TaskAttempt, TaskAttemptCreation } from '../types/TaskAttempt.types';
import Task from './Task';
import TeamModel from './Team';
import StudentModel from './Student';

// model class definition
class TaskAttemptModel extends Model<TaskAttempt, TaskAttemptCreation> {
    declare id_task_attempt: number;
    declare id_task: number;
    declare id_team: number;
    declare id_student: number;
    declare task_phase: string;
    declare completed: boolean;
    declare start_time: Date;
    declare end_time: Date;
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
    task_phase: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
        beforeCreate: async ({ task_phase, id_team, id_student }: TaskAttemptModel) => {
            if (task_phase !== 'pretask' && task_phase !== 'duringtask' && task_phase !== 'postask') {
                throw new Error('task_phase must be one of the following values: pretask, duringtask, postask');
            }
            if (!id_student && !id_team) {
                throw new Error('Either id_student or id_team must be provided');
            }
        },
    },
});

// definir la relación entre Tareas y Intentos de Tareas
Task.hasMany(TaskAttemptModel, {
    foreignKey: 'id_task'
});
TaskAttemptModel.belongsTo(Task, {
    foreignKey: 'id_task'
});

// definir la relación entre Teams y Intentos de Tareas
TeamModel.hasMany(TaskAttemptModel, {
    foreignKey: 'id_team'
});
TaskAttemptModel.belongsTo(TeamModel, {
    foreignKey: {
        name: 'id_team',
        allowNull: true
    }
});

// definir la relación entre Estudiantes y Intentos de Tareas
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
