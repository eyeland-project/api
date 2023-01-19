// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Instituciones from './Instituciones';
import { comparePassword, hashPassword } from '../utils';
import { ProfesorModel } from '../types/Profesores.types';

// model definition
const Profesores = sequelize.define<ProfesorModel>('profesores', {
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
    id_institucion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    timestamps: false,
    hooks: {
        beforeCreate: async (profesor: any) => {
            profesor.password = hashPassword(profesor.password);
        },
    }
});

// definir la relación entre Instituciones y Profesores
Instituciones.hasMany(Profesores, {
    foreignKey: 'id_institucion'
});
Profesores.belongsTo(Instituciones, {
    foreignKey: 'id_institucion'
});

Profesores.prototype.comparePassword = comparePassword;

export default Profesores;
module.exports = Profesores;
