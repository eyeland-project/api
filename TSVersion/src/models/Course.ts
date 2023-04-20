// imports
import { DataTypes, ForeignKey, Model } from "sequelize";
import sequelize from "@database/db";
import { TeacherModel, InstitutionModel } from "@models";
import { Course, CourseCreation } from "@interfaces/Course.types";

// model class definition
class CourseModel extends Model<Course, CourseCreation> {
  declare id_course: number;
  declare id_teacher: ForeignKey<number>;
  declare id_institution: ForeignKey<number>;
  declare name: string;
  declare session: boolean;
}

// model initialization
CourseModel.init(
  {
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
    session: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "CourseModel",
    tableName: "course",
    timestamps: false
  }
);

// model associations
// course and teacher
TeacherModel.hasMany(CourseModel, {
  foreignKey: "id_teacher"
});
CourseModel.belongsTo(TeacherModel, {
  foreignKey: "id_teacher"
});

// course and institution
InstitutionModel.hasMany(CourseModel, {
  foreignKey: "id_institution"
});
CourseModel.belongsTo(InstitutionModel, {
  foreignKey: "id_institution"
});

export default CourseModel;
