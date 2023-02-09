// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import Course from './Course';
import Team from './Team';
import { comparePassword, hashPassword } from '../utils';
import { StudentModel } from '../types/Student.types';

// model definition
const Student = sequelize.define<StudentModel>('student', {
    id_student: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_course: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    current_team: {
        type: DataTypes.INTEGER
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
    },
    blindness: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    timestamps: false,
    hooks: {
        beforeCreate: async (student: StudentModel) => {
            const { blindness } = student;
            if (blindness !== 'total' && blindness !== 'partial' && blindness !== 'none') {
                throw new Error('blindness must be one of the following values: total, partial, none');
            }
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

// definir la relación entre Cursos y Estudiantes
Course.hasMany(Student, {
    foreignKey: 'id_course'
});
Student.belongsTo(Course, {
    foreignKey: 'id_course'
});

// definir la relación entre Teams y Estudiantes
Team.hasMany(Student, {
    foreignKey: 'current_team'
});
Student.belongsTo(Team, {
    foreignKey: 'current_team'
});

Student.prototype.comparePassword = comparePassword;

export default Student;
module.exports = Student;
