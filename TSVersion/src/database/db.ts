// creating a sequelize instance to postgres database
import { Sequelize } from "sequelize";
// const {database_conf} = require('./config');

let conf: any[];
if (process.env.DB_URL) {
  conf = [
    process.env.DB_URL,
    {
      dialect: "postgres",
      protocol: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    }
  ];
} else {
  conf = [
    process.env.DB_NAME || "mydb",
    process.env.DB_USER || "myuser",
    process.env.DB_PASSWORD || "mypass",
    {
      host: process.env.DB_HOST || "localhost",
      dialect: "postgres",
      logging: false,
      define: {
        freezeTableName: true
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  ];
}

const sequelize = new Sequelize(...conf);

// exporting the sequelize instance
export default sequelize;
module.exports = sequelize;
