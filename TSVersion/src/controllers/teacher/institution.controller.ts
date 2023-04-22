import { InstitutionDetailDto } from "@dto/teacher/institution.dto";
import { getInstitution as getInstitutionService } from "@services/institution.service";
import { NextFunction, Request, Response } from "express";

export async function getInstitution(
  req: Request<{ idInstitution: number }>,
  res: Response<InstitutionDetailDto>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    res.status(200).json(await getInstitutionService(idTeacher));
  } catch (err) {
    next(err);
  }
}
