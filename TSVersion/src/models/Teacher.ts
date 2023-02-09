// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Institution from './Institution';
import { comparePassword, hashPassword } from '../utils';
import { TeacherModel } from '../types/Teacher.types';

// model definition
// const Teacher = sequelize.define<TeacherModel>('teacher', {
//     id_teacher: {
//         type: DataTypes.SMALLINT,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     id_institution: {
//         type: DataTypes.SMALLINT,
//         allowNull: false
//     },
//     first_name: {
//         type: DataTypes.STRING(100),
//         allowNull: false
//     },
//     last_name: {
//         type: DataTypes.STRING(100),
//         allowNull: false
//     },
//     email: {
//         type: DataTypes.STRING(320),
//         allowNull: false,
//         unique: true
//     },
//     username: {
//         type: DataTypes.STRING(50),
//         allowNull: false,
//         unique: true
//     },
//     password: {
//         type: DataTypes.CHAR(60),
//         allowNull: false
//     }
// }, {
//     timestamps: false,
//     hooks: {
//         beforeCreate: async (teacher: TeacherModel) => {
//             teacher.password = hashPassword(teacher.password);
//         },
//     }
// });
// Teacher.prototype.comparePassword = comparePassword;

// model class definition
class Teacher extends Model implements TeacherModel {
    id_teacher!: number;
    id_institution!: number;
    first_name!: string;
    last_name!: string;
    email!: string;
    username!: string;
    password!: string;
}

// model initialization
Teacher.init({
    id_teacher: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true
    },
    id_institution: {
        type: DataTypes.SMALLINT,
        allowNull: false
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
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.CHAR(60),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Teacher',
    tableName: 'teacher',
    timestamps: false,
    hooks: {
        beforeCreate: async (teacher: TeacherModel) => {
            teacher.password = hashPassword(teacher.password);
        },
    }
});

// definir la relación entre Instituciones y Profesores
Institution.hasMany(Teacher, {
    foreignKey: 'id_institucion'
});
Teacher.belongsTo(Institution, {
    foreignKey: 'id_institucion'
});

export default Teacher;
module.exports = Teacher;
