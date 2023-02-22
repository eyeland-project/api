import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { BlindnessAcuity } from "../types/BlindnessAcuity.types";

// export async function getBlindnessAcuityFromStudent(idStudent: number): Promise<BlindnessAcuity> {
//     await sequelize.query<BlindnessAcuity>(`
//         SELECT ba.* FROM student s
//         JOIN blindness_acuity ba ON ba.id_blindness_acuity = s.id_blindness_acuity
//         WHERE s.id_student = ${idStudent};
//     `, { type: QueryTypes.SELECT });
// }