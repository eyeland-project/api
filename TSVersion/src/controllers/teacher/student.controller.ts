import { Request, Response, NextFunction } from "express";
import {
  StudentDetailDto,
  StudentSummaryDto,
  StudentCreateDto,
  StudentUpdateDto
} from "@dto/teacher/student.dto";
import {
  getStudent as getStudentService,
  getStudents as getStudentsService,
  createStudent as createStudentService,
  updateStudent as updateStudentService,
  deleteStudent as deleteStudentService,
  createStudentFromCsv as createStudentFromCsvService
} from "@services/student.service";
import { ApiError } from "@middlewares/handleErrors";

export async function getStudents(
  req: Request<{ idCourse: string }>,
  res: Response<StudentSummaryDto[]>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    res.status(200).json(await getStudentsService(idTeacher, idCourse));
  } catch (err) {
    next(err);
  }
}

export async function getStudent(
  req: Request<{ idCourse: string; idStudent: string }>,
  res: Response<StudentDetailDto>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idStudent = parseInt(req.params.idStudent);
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idStudent) || idStudent <= 0) {
      throw new ApiError("Invalid student id", 400);
    }
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    res
      .status(200)
      .json(await getStudentService(idTeacher, idCourse, idStudent));
  } catch (err) {
    next(err);
  }
}

export async function createStudent(
  req: Request<{ idCourse: string }, any, StudentCreateDto>,
  res: Response<{ id: number }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    res
      .status(201)
      .json(await createStudentService(idTeacher, idCourse, req.body));
  } catch (err) {
    next(err);
  }
}

export async function createBulkStudent(
  req: Request<{ idCourse: string }, any, StudentCreateDto>,
  res: Response<{ id: number } | { id: number }[]>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    if (!req.file) {
      throw new ApiError("No file provided", 400);
    }
    res
      .status(201)
      .json(
        await createStudentFromCsvService(idTeacher, idCourse, req.file.buffer)
      );
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(
  req: Request<{ idCourse: string; idStudent: string }>,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    const idStudent = parseInt(req.params.idStudent);
    if (isNaN(idStudent) || idStudent <= 0) {
      throw new ApiError("Invalid student id", 400);
    }
    const idCourse = parseInt(req.params.idCourse);
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    const fields = req.body as StudentUpdateDto;
    if (!Object.keys(fields).length) {
      throw new ApiError("No fields to update", 400);
    }
    await updateStudentService(idTeacher, idCourse, idStudent, fields);
    res.status(200).json({ message: "Student updated successfully" });
  } catch (err) {
    next(err);
  }
}

export async function deleteStudent(
  req: Request<{ idCourse: string; idStudent: string }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idStudent = parseInt(req.params.idStudent);
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idStudent) || idStudent <= 0) {
      throw new ApiError("Invalid student id", 400);
    }
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    await deleteStudentService(idTeacher, idCourse, idStudent);
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    next(err);
  }
}
