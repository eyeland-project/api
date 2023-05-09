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
  req: Request<
    { idCourse: string; idTaskAttempt: string; idAnswer: string },
    any,
    GradeAnswerCreateDto
  >,
  res: Response<{ id: number }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  const idTaskAttempt = parseInt(req.params.idTaskAttempt);
  const idAnswer = parseInt(req.params.idAnswer);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    if (isNaN(idTaskAttempt) || idTaskAttempt <= 0) {
      throw new ApiError("Invalid task attempt id", 400);
    }
    if (isNaN(idAnswer) || idAnswer <= 0) {
      throw new ApiError("Invalid answer id", 400);
    }
    res
      .status(201)
      .json(
        await createGradeAnswerService(
          idTeacher,
          idCourse,
          idTaskAttempt,
          idAnswer,
          req.body
        )
      );
  } catch (err) {
    next(err);
  }
}

export async function updateGradeAnswer(
  req: Request<
    {
      idCourse: string;
      idTaskAttempt: string;
      idAnswer: string;
      idGradeAnswer: string;
    },
    any,
    GradeAnswerUpdateDto
  >,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  const idTaskAttempt = parseInt(req.params.idTaskAttempt);
  const idAnswer = parseInt(req.params.idAnswer);
  const idGradeAnswer = parseInt(req.params.idGradeAnswer);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    if (isNaN(idTaskAttempt) || idTaskAttempt <= 0) {
      throw new ApiError("Invalid task attempt id", 400);
    }
    if (isNaN(idAnswer) || idAnswer <= 0) {
      throw new ApiError("Invalid answer id", 400);
    }
    if (isNaN(idGradeAnswer) || idGradeAnswer <= 0) {
      throw new ApiError("Invalid gradeAnswer id", 400);
    }
    const fields = req.body;
    if (!Object.keys(fields).length) {
      throw new ApiError("No fields to update", 400);
    }
    await updateGradeAnswerService(
      idTeacher,
      idCourse,
      idTaskAttempt,
      idAnswer,
      idGradeAnswer,
      fields
    );
    res.status(200).json({ message: "GradeAnswer updated successfully" });
  } catch (err) {
    next(err);
  }
}

export async function deleteGradeAnswer(
  req: Request<{
    idCourse: string;
    idTaskAttempt: string;
    idAnswer: string;
    idGradeAnswer: string;
  }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  const idTaskAttempt = parseInt(req.params.idTaskAttempt);
  const idAnswer = parseInt(req.params.idAnswer);
  const idGradeAnswer = parseInt(req.params.idGradeAnswer);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    if (isNaN(idTaskAttempt) || idTaskAttempt <= 0) {
      throw new ApiError("Invalid task attempt id", 400);
    }
    if (isNaN(idAnswer) || idAnswer <= 0) {
      throw new ApiError("Invalid answer id", 400);
    }
    if (isNaN(idGradeAnswer) || idGradeAnswer <= 0) {
      throw new ApiError("Invalid gradeAnswer id", 400);
    }
    await deleteGradeAnswerService(
      idTeacher,
      idCourse,
      idTaskAttempt,
      idAnswer,
      idGradeAnswer
    );
    res.status(200).json({ message: "GradeAnswer deleted successfully" });
  } catch (err) {
    next(err);
  }
}
