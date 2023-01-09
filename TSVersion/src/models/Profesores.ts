// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Instituciones from './Instituciones';

// model definition
const Profesores = sequelize.define('profesores', {
    id_profesor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: false
});

// definir la relación entre Instituciones y Profesores
Instituciones.hasMany(Profesores, {
    foreignKey: 'id_institucion'
});
Profesores.belongsTo(Instituciones, {
    foreignKey: 'id_institucion'
});

export default Profesores;
module.exports = Profesores;
