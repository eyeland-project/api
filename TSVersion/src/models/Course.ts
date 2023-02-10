// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import InstitutionModel from './Institution';
import TeacherModel from './Teacher';
import { Course, CourseCreation } from '../types/Course.types';

// model class definition
class CourseModel extends Model<Course, CourseCreation> {
    declare id_course: number;
    declare id_teacher: number;
    declare id_institution: number;
    declare name: string;
    declare description: string;
    declare status: boolean;
}

// model initialization
CourseModel.init({
    id_course: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true
    },
    id_teacher: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    id_institution: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(1000)
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'CourseModel',
    tableName: 'course',
    timestamps: false
});

// definir la relación entre Profesores y Cursos
TeacherModel.hasMany(CourseModel, {
    foreignKey: 'id_teacher'
});
CourseModel.belongsTo(TeacherModel, {
    foreignKey: 'id_teacher'
});

// definir la relación entre Instituciones y Cursos
InstitutionModel.hasMany(CourseModel, {
    foreignKey: 'id_institution'
});
CourseModel.belongsTo(InstitutionModel, {
    foreignKey: 'id_institution'
});

export default CourseModel;
