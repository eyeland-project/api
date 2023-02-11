// creating the model for the Task table
// imports
import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database';
import { TaskPhase, TaskPhaseCreation } from '../types/database/TaskPhase.types';
import TaskModel from './Task';

// model class definition
class TaskPhaseModel extends Model<TaskPhase, TaskPhaseCreation> {
    declare id_task_phase: number;
    declare id_task: ForeignKey<number>;
    declare task_phase_order: number;
    declare name: string;
    declare description: string;
    declare long_description?: string;
    declare keywords: string[];
    declare thumbnail_url?: string;
}

// model initialization
TaskPhaseModel.init({
    id_task_phase: {
        type: DataTypes.SMALLINT,
        autoIncrement: true,
        primaryKey: true
    },
    id_task: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    task_phase_order: {
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
    }
}, {
    sequelize,
    modelName: 'TaskPhaseModel',
    tableName: 'task_phase',
    timestamps: false
});

// model associations
// task phase and task
TaskModel.hasMany(TaskPhaseModel, {
    foreignKey: 'id_task'
});
TaskPhaseModel.belongsTo(TaskModel, {
    foreignKey: 'id_task'
});

export default TaskPhaseModel;
