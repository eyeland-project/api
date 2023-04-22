import { ApiError } from "@middlewares/handleErrors";
import { TeacherModel } from "@models";
import { Teacher } from "@interfaces/Teacher.types";

export async function getTeacher(
  where: Partial<Teacher>
): Promise<TeacherModel> {
  const teacher = await TeacherModel.findOne({
    where
  });
  if (!teacher) throw new ApiError("Teacher not found", 404);
  return teacher;
}
