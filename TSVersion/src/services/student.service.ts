import { QueryTypes } from "sequelize";
import sequelize from "../database";
import StudentModel from "../models/Student";

// export async function hasTeam(student: StudentModel): Promise<boolean> {
//     const team = await sequelize.query(`

//     `, {
//         type: QueryTypes.SELECT,
//     });
//     return !!team; // if team is not null, then the student has a team
// }
