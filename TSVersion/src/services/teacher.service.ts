import { ApiError } from "@middlewares/handleErrors";
import { InstitutionModel, TeacherModel } from "@models";
import { Teacher } from "@interfaces/Teacher.types";
import { Institution } from "@interfaces/Institution.types";

export async function getTeacherById(idTeacher: number): Promise<Teacher> {
  const teacher = await TeacherModel.findOne({
    where: { id_teacher: idTeacher }
  });
  if (!teacher) throw new ApiError("Teacher not found", 404);
  return teacher;
}

export async function getInstitutionFromTeacher(
  idTeacher: number
): Promise<Institution> {
  const teacher = await TeacherModel.findOne({
    where: { id_teacher: idTeacher },
    include: [
      {
        model: InstitutionModel,
        as: "institution"
      }
    ]
  });
  if (!teacher) throw new ApiError("Teacher not found", 404);
  return teacher.institution;
}
