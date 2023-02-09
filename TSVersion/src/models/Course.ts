// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Institution from './Institution';
import Teacher from './Teacher';
import { CourseModel } from '../types/Course.types';

// model class definition
class Course extends Model implements CourseModel {
    id_course!: number;
    id_teacher!: number;
    id_institution!: number;
    name!: string;
    description!: string;
    status!: boolean;
}

// model initialization
Course.init({
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
    modelName: 'Course',
    tableName: 'course',
    timestamps: false
});

// definir la relación entre Profesores y Cursos
Teacher.hasMany(Course, {
    foreignKey: 'id_teacher'
});
Course.belongsTo(Teacher, {
    foreignKey: 'id_teacher'
});

// definir la relación entre Instituciones y Cursos
Institution.hasMany(Course, {
    foreignKey: 'id_institution'
});
Course.belongsTo(Institution, {
    foreignKey: 'id_institution'
});

export default Course;
module.exports = Course;
