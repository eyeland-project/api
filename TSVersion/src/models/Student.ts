// imports
import { DataTypes, ForeignKey, Model, NonAttribute } from "sequelize";
import sequelize from "../database/db";
import CourseModel from "./Course";
import { comparePassword, hashPassword } from "../utils";
import { Student, StudentCreation } from "../types/Student.types";
import { ApiError } from "../middlewares/handleErrors";
import BlindnessAcuityModel from "./BlindnessAcuity";

// model class definition
class StudentModel extends Model<Student, StudentCreation> {
  declare id_student: number;
  declare id_course: ForeignKey<number>;
  declare id_blindness_acuity: ForeignKey<number>;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare username: string;
  declare password: string;

  declare BlindnessAcuityModel: NonAttribute<BlindnessAcuityModel>;

  comparePassword = (password: string): boolean =>
    // comparePassword(password, this.password)
    password === this.password; // temporary
}

// model initialization
StudentModel.init(
  {
    id_student: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_course: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_blindness_acuity: {
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
      allowNull: false
      // set(value: string) {
      //     this.setDataValue('password', hashPassword(value));
      // }
    },
    comparePassword: {
      type: DataTypes.VIRTUAL
    }
  },
  {
    sequelize,
    modelName: "StudentModel",
    tableName: "student",
    timestamps: false,
    hooks: {
      beforeCreate: async (student: StudentModel) => {
        student.password = hashPassword(student.password);
      }
    }
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
  }
);

// model associations
// student and course
CourseModel.hasMany(StudentModel, {
  foreignKey: "id_course"
});
StudentModel.belongsTo(CourseModel, {
  foreignKey: "id_course"
});

// student and blindness_acuity
BlindnessAcuityModel.hasMany(StudentModel, {
  foreignKey: "id_blindness_acuity"
});
StudentModel.belongsTo(BlindnessAcuityModel, {
  foreignKey: "id_blindness_acuity"
});

export default StudentModel;
