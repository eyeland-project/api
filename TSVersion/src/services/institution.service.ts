import { InstitutionDetailDto } from "@dto/teacher/institution.dto";
import { ApiError } from "@middlewares/handleErrors";
import { InstitutionModel, TeacherModel } from "@models";
import * as repositoryService from "@services/repository.service";

export async function getInstitution(
  idTeacher: number
): Promise<InstitutionDetailDto> {
  const teacher = await repositoryService.findOne<TeacherModel>(TeacherModel, {
    where: { id_teacher: idTeacher },
    include: [
      {
        model: InstitutionModel,
        as: "institution"
      }
    ]
  });
  if (!teacher) throw new ApiError("Teacher not found", 404);
  const {
    institution: {
      id_institution,
      name,
      nit,
      address,
      city,
      country,
      phone_code,
      phone_number,
      email,
      website_url
    }
  } = teacher;
  return {
    id: id_institution,
    name,
    nit,
    address,
    city,
    country,
    phone: {
      countryCode: phone_code,
      number: phone_number
    },
    email,
    websiteUrl: website_url || null
  };
}
