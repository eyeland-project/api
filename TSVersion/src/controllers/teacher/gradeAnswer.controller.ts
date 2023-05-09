import { Request, Response, NextFunction } from "express";
import {
  GradeAnswerCreateDto,
  GradeAnswerUpdateDto
} from "@dto/teacher/gradeAnswer.dto";
import {
  createGradeAnswer as createGradeAnswerService,
  updateGradeAnswer as updateGradeAnswerService,
  deleteGradeAnswer as deleteGradeAnswerService
} from "@services/gradeAnswer.service";
import { ApiError } from "@middlewares/handleErrors";

export async function createGradeAnswer(
  req: Request<any, any, GradeAnswerCreateDto>,
  res: Response<{ id: number }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    res.status(201).json(await createGradeAnswerService(idTeacher, req.body));
  } catch (err) {
    next(err);
  }
}

export async function updateGradeAnswer(
  req: Request<{ idGradeAnswer: string }, any, GradeAnswerUpdateDto>,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    const idGradeAnswer = parseInt(req.params.idGradeAnswer);
    if (isNaN(idGradeAnswer) || idGradeAnswer <= 0) {
      throw new ApiError("Invalid gradeAnswer id", 400);
    }
    const fields = req.body;
    if (!Object.keys(fields).length) {
      throw new ApiError("No fields to update", 400);
    }
    await updateGradeAnswerService(idTeacher, idGradeAnswer, fields);
    res.status(200).json({ message: "GradeAnswer updated successfully" });
  } catch (err) {
    next(err);
  }
}

export async function deleteGradeAnswer(
  req: Request<{ idGradeAnswer: string }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idGradeAnswer = parseInt(req.params.idGradeAnswer);
  try {
    if (isNaN(idGradeAnswer) || idGradeAnswer <= 0) {
      throw new ApiError("Invalid gradeAnswer id", 400);
    }
    await deleteGradeAnswerService(idTeacher, idGradeAnswer);
    res.status(200).json({ message: "GradeAnswer deleted successfully" });
  } catch (err) {
    next(err);
  }
}
