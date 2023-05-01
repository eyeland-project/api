import { Request, Response, NextFunction } from "express";
import {
  createSession as createSessionService,
  startSession as startSessionService,
  endSession as endSessionService
} from "@services/course.service";
import {
  CourseDetailDto,
  CourseSummaryDto,
  CourseCreateDto,
  CourseUpdateDto
} from "@dto/teacher/course.dto";
import {
  getCourse as getCourseService,
  getCourses as getCoursesService,
  createCourse as createCourseService,
  updateCourse as updateCourseService,
  deleteCourse as deleteCourseService
} from "@services/course.service";
import { ApiError } from "@middlewares/handleErrors";

export async function getCourses(
  req: Request,
  res: Response<CourseSummaryDto[]>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    res.status(200).json(await getCoursesService(idTeacher));
  } catch (err) {
    next(err);
  }
}

export async function getCourse(
  req: Request<{ idCourse: string }>,
  res: Response<CourseDetailDto>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    res.status(200).json(await getCourseService(idTeacher, idCourse));
  } catch (err) {
    next(err);
  }
}

export async function createCourse(
  req: Request<any, any, CourseCreateDto>,
  res: Response<{ id: number }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    res.status(201).json(await createCourseService(idTeacher, req.body));
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(
  req: Request<{ idCourse: string }, any, CourseUpdateDto>,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    const idCourse = parseInt(req.params.idCourse);
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    const fields = req.body;
    if (!Object.keys(fields).length) {
      throw new ApiError("No fields to update", 400);
    }
    await updateCourseService(idTeacher, idCourse, fields);
    res.status(200).json({ message: "Course updated successfully" });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(
  req: Request<{ idCourse: string }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const idCourse = parseInt(req.params.idCourse);
  try {
    if (isNaN(idCourse) || idCourse <= 0) {
      throw new ApiError("Invalid course id", 400);
    }
    await deleteCourseService(idTeacher, idCourse);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function createSession(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const { idCourse } = req.params;
  try {
    await createSessionService(idTeacher, idCourse);
    res.status(201).json({ message: "Session created successfully" });
  } catch (err) {
    next(err);
  }
}

export async function startSession(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const { idCourse } = req.params;
  try {
    await startSessionService(idTeacher, idCourse);
    res.status(200).json({ message: "Session started successfully" });
  } catch (err) {
    next(err);
  }
}

export async function endSession(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const { idCourse } = req.params;
  try {
    await endSessionService(idTeacher, idCourse);
    res.status(200).json({ message: "Session ended successfully" });
  } catch (err) {
    next(err);
  }
}
