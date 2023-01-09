// creating the model for the tasks table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Tasks from "./Tasks"

// model definition
const Links = sequelize.define('links',{
    id_link:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tema: {
        type: DataTypes.STRING,
        allowNull: false
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

export default Links;
module.exports = Links;
