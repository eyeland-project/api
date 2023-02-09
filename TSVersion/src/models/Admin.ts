// creating the model for the Admin table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import { comparePassword, hashPassword } from '../utils';
import { Admin, AdminModel } from '../types/Admins.types';

// model definition
const Admin = sequelize.define<AdminModel>('admin', {
    id_admin: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(320),
        unique: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(60), // 60 porque se usa bcrypt
        allowNull: false,
        // set(value: string) {
        //     this.setDataValue('password', hashPassword(value));
        // }
    }
}, {
    timestamps: false,
    hooks: {
        beforeCreate: async (student: AdminModel) => {
            student.password = hashPassword(student.password);
        },
    },
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['username']
        }
    ]
});

Admin.prototype.comparePassword = comparePassword;

export default Admin;
module.exports = Admin;
