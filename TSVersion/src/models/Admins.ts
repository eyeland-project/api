// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import { comparePassword, hashPassword } from '../utils';
import { AdminModel } from '../types/Admins.types';


// model definition
const Admins = sequelize.define<AdminModel>('admins', {
    id_admin: {
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
        unique: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    hooks: {
        beforeCreate: async (admin: any) => {
            admin.password = hashPassword(admin.password);
        },
    }
});

Admins.prototype.comparePassword = comparePassword;

export default Admins;
module.exports = Admins;
