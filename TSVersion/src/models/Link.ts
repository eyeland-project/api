// creating the model for the Link table
// imports
import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database';
import TaskModel from "./Task"
import { Link, LinkCreation } from '../types/database/Link.types';


// model class definition
class LinkModel extends Model<Link, LinkCreation> {
    declare id_link: number;
    declare id_task: ForeignKey<number>;
    declare topic: string;
    declare url: string;
}

// model initialization
LinkModel.init({
    id_link: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_task: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    topic: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING(2048),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'LinkModel',
    tableName: 'link',
    timestamps: false,
});

// model associations
// link and task
TaskModel.hasMany(LinkModel, {
    foreignKey: 'id_task'
});
LinkModel.belongsTo(TaskModel, {
    foreignKey: 'id_task'
});

export default LinkModel;
