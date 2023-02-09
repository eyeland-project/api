// creating the model for the Link table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Task from "./Task"
import { LinkModel } from '../types/Links.types';

// model definition
const Link = sequelize.define<LinkModel>('link', {
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
    timestamps: false,
});

Task.hasMany(Link, {
    foreignKey: 'id_task'
});

Link.belongsTo(Task, {
    foreignKey: 'id_task'
});

export default Link;
module.exports = Link;
