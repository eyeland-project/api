import { ApiError } from "../middlewares/handleErrors";
import { TeacherModel } from "../models";
import { Teacher } from "../types/Teacher.types";

export async function getTeacherById(idTeacher: number): Promise<Teacher> {
    const teacher = await TeacherModel.findOne({ where: { id_teacher: idTeacher } });
    if (!teacher) throw new ApiError("Teacher not found", 404);
    return teacher;
}
