import { InstitutionDetailDto } from "@dto/teacher/institution.dto";
import { getInstitutionFromTeacher } from "@services/teacher.service";
import { NextFunction, Request, Response } from "express";

export async function getInstitution(
  req: Request<{ idInstitution: number }>,
  res: Response<InstitutionDetailDto>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    const {
      id_institution,
      phone_code,
      phone_number,
      website_url,
      address,
      city,
      country,
      email,
      name,
      nit
    } = await getInstitutionFromTeacher(idTeacher);
    res.status(200).json({
      id: id_institution,
      phone: {
        countryCode: phone_code,
        number: phone_number
      },
      websiteUrl: website_url || null,
      address,
      city,
      country,
      email,
      name,
      nit
    });
  } catch (err) {
    next(err);
  }
}
