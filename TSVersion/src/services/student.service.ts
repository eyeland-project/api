import { ApiError } from "../middlewares/handleErrors";
import { StudentModel } from "../models";
import { Student } from "../types/database/Student.types";

export async function getStudentById(id: number): Promise<Student> {
    const student = await StudentModel.findByPk(id);
    if (!student) throw new ApiError(`Student with id ${id} not found`, 404);
    return student;
}

// export async function hasTeam(student: StudentModel): Promise<boolean> {
//     const team = await sequelize.query(`

//     `, {
//         type: QueryTypes.SELECT,
//     });
//     return !!team; // if team is not null, then the student has a team
// }
