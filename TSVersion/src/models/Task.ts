// creating the model for the Task table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import { TaskModel } from '../types/Task.types';

// model definition
const Task = sequelize.define<TaskModel>('task', {
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
    timestamps: false
});

export default Task;
module.exports = Task;
