import * as dotenv from "dotenv";
import * as path from "path";
import sequelize from "@database/db";

dotenv.config({ override: true });
if (process.env.NODE_ENV) {
  const result = dotenv.config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`)
  });
  if (process.env.NODE_ENV !== "production" && result.error) {
    console.log(process.env.NODE_ENV);
    // throw result.error;
  }
}

import { data } from "./data";
import migrate from "./migration";
sequelize.authenticate().then(() => {
  console.log("Database connected");
  sequelize.sync({ force: false, alter: false }).then(
    () => {
      console.log("Database synchronized");
      migrate(data);
    },
    (err) => {
      console.log(err);
    }
  );
});
