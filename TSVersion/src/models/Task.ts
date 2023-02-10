// creating the model for the Task table
// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { Task, TaskCreation } from '../types/Task.types';

// model class definition
class TaskModel extends Model<Task, TaskCreation> {
    declare id_task: number;
    declare name: string;
    declare description: string;
    declare task_order: number;
    declare thumbnail_url: string;
    declare msg_pretask: string;
    declare msg_duringtask: string;
    declare msg_postask: string;
    declare deleted: boolean;
}

// model initialization
TaskModel.init({
    id_task: {
        type: DataTypes.SMALLINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(2000),
        allowNull: false
    },
    task_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    thumbnail_url: {
        type: DataTypes.STRING(2048)
    },
    msg_pretask: {
        type: DataTypes.STRING(1000)
    },
    msg_duringtask: {
        type: DataTypes.STRING(1000)
    },
    msg_postask: {
        type: DataTypes.STRING(1000)
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'TaskModel',
    tableName: 'task',
    timestamps: false
});

export default TaskModel;
