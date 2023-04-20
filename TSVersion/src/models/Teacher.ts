// imports
import { DataTypes, ForeignKey, Model } from "sequelize";
import sequelize from "@database/db";
import { InstitutionModel } from "@models";
import { comparePassword, hashPassword } from "@utils";
import { Teacher, TeacherCreation } from "@interfaces/Teacher.types";

// model class definition
class TeacherModel extends Model<Teacher, TeacherCreation> {
  declare id_teacher: number;
  declare id_institution: ForeignKey<number>;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare username: string;
  declare password: string;
  declare phone_code: string;
  declare phone_number: string;
  comparePassword = (password: string): boolean =>
    // comparePassword(password, this.password)
    password === this.password; // temporary
}

// model initialization
TeacherModel.init(
  {
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
    },
    comparePassword: {
      type: DataTypes.VIRTUAL
    },
    phone_code: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "TeacherModel",
    tableName: "teacher",
    timestamps: false,
    hooks: {
      beforeCreate: async (teacher: TeacherModel) => {
        teacher.password = hashPassword(teacher.password);
      }
    }
  }
);

// model associations
// teacher and institution
InstitutionModel.hasMany(TeacherModel, {
  foreignKey: "id_institution"
});
TeacherModel.belongsTo(InstitutionModel, {
  foreignKey: "id_institution"
});

export default TeacherModel;
