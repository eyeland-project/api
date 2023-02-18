// imports
import { DataTypes, ForeignKey, Model } from 'sequelize';
import sequelize from '../database/db';
import CourseModel from './Course';
import { comparePassword, hashPassword } from '../utils';
import { Student, StudentCreation } from '../types/database/Student.types';
import { ApiError } from '../middlewares/handleErrors';

// model class definition
class StudentModel extends Model<Student, StudentCreation> {
    declare id_student: number;
    declare id_course: ForeignKey<number>;
    declare first_name: string;
    declare last_name: string;
    declare email: string;
    declare username: string;
    declare password: string;
    declare blindness: 'total' | 'partial' | 'none';
    comparePassword = (password: string): boolean => (
        // comparePassword(password, this.password)
        password === this.password // temporary
    )
}

// model initialization
StudentModel.init({
    id_student: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_course: {
        type: DataTypes.INTEGER,
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
        unique: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(60), // 60 because of bcrypt
        allowNull: false,
        // set(value: string) {
        //     this.setDataValue('password', hashPassword(value));
        // }
    },
    blindness: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    comparePassword: {
        type: DataTypes.VIRTUAL
    }
}, {
    sequelize,
    modelName: 'StudentModel',
    tableName: 'student',
    timestamps: false,
    hooks: {
        beforeCreate: async (student: StudentModel) => {
            const { blindness } = student;
            if (blindness !== 'total' && blindness !== 'partial' && blindness !== 'none') {
                throw new ApiError('Blindness must be one of the following values: total, partial, none', 400);
            }
            student.password = hashPassword(student.password);
        },
    },
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['email']
    //     },
    //     {
    //         unique: true,
    //         fields: ['username']
    //     }
    // ]
});

// model associations
// student and course
CourseModel.hasMany(StudentModel, {
    foreignKey: 'id_course'
});
StudentModel.belongsTo(CourseModel, {
    foreignKey: 'id_course'
});

export default StudentModel;
