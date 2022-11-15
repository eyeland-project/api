// creating the model for the tasks table
// imports
const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Tasks = require("./Tasks")

// model definition
const Links = sequelize.define('links',{
    id_link:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tema: {
        type: DataTypes.STRING,
        allowNull: true
    },
    url_dir: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, 
{
    timestamps: false
});

Tasks.hasMany(Links, {
    foreignKey: 'id_task'
  });
Links.belongsTo(Tasks, {
    foreignKey: 'id_task'
  });

module.exports = Links;
