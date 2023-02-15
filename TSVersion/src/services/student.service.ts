import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { StudentModel } from "../models";

// export async function hasTeam(student: StudentModel): Promise<boolean> {
//     const team = await sequelize.query(`

//     `, {
//         type: QueryTypes.SELECT,
//     });
//     return !!team; // if team is not null, then the student has a team
// }
