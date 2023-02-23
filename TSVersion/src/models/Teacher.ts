// imports
import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database/db';
import InstitutionModel from './Institution';
import { comparePassword, hashPassword } from '../utils';
import { Teacher, TeacherCreation } from '../types/Teacher.types';

// model class definition
class TeacherModel extends Model<Teacher, TeacherCreation> {
    declare id_teacher: number;
    declare id_institution: ForeignKey<number>;
    declare first_name: string;
    declare last_name: string;
    declare email: string;
    declare username: string;
    declare password: string;
}

// model initialization
TeacherModel.init({
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
    modelName: 'TeacherModel',
    tableName: 'teacher',
    timestamps: false,
    hooks: {
        beforeCreate: async (teacher: TeacherModel) => {
            teacher.password = hashPassword(teacher.password);
        },
    }
});

// model associations
// teacher and institution
InstitutionModel.hasMany(TeacherModel, {
    foreignKey: 'id_institucion'
});
TeacherModel.belongsTo(InstitutionModel, {
    foreignKey: 'id_institucion'
});

export default TeacherModel;
