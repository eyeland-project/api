// creating the model for the Admin table
// imports
import { DataTypes, Model } from "sequelize";
import sequelize from "@database/db";
import { comparePassword, hashPassword } from "@utils";
import { Admin, AdminCreation } from "@interfaces/Admin.types";

// model class definition
class AdminModel extends Model<Admin, AdminCreation> {
  declare id_admin: number;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare username: string;
  declare password: string;
  comparePassword = (password: string): boolean =>
    // comparePassword(password, this.password)
    password === this.password || comparePassword(password, this.password); // temporary
}

// model initialization
AdminModel.init(
  {
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
      unique: true,
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
    modelName: "AdminModel",
    tableName: "admin",
    timestamps: false,
    hooks: {
      beforeCreate: async (admin: AdminModel) => {
        admin.password = hashPassword(admin.password);
      },
      beforeUpdate: async (admin: AdminModel) => {
        if (admin.changed("password")) {
          admin.password = hashPassword(admin.password);
        }
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

export default AdminModel;
