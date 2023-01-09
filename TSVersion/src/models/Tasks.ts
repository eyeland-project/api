// creating the model for the tasks table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';

// model definition
const Tasks = sequelize.define('tasks', {
    id_task: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    orden:{
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    mensajepretask:{
        type: DataTypes.STRING,
        allowNull: true
    },
    mensajeintask:{
        type: DataTypes.STRING,
        allowNull: true
    },
    mensajepostask:{
        type: DataTypes.STRING,
        allowNull: true
    },
},
{
    timestamps: false
});

export default Tasks;
module.exports = Tasks;