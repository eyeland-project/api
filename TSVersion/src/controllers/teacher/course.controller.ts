import { Request, Response, NextFunction } from "express";
import * as courseService from "@services/course.service";
import {
  CourseDetailDto,
  CourseSummaryDto,
  CourseCreateDto,
  CourseUpdateDto
} from "@dto/teacher/course.dto";
import {
  deleteCourseFromTeacher,
  getCourseFromTeacher,
  getCoursesFromTeacher,
  updateCourseFromTeacher
} from "@services/teacher.service";

export async function getCourses(
  req: Request,
  res: Response<CourseSummaryDto[]>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  try {
    const courses = await getCoursesFromTeacher(idTeacher);
    res.status(200).json(
      courses.map(({ id_course, name }) => ({
        id: id_course,
        name
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function getCourse(
  req: Request<{ idCourse: number }>,
  res: Response<CourseDetailDto>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const { idCourse } = req.params;
  try {
    const { id_course, name, session } = await getCourseFromTeacher(
      idTeacher,
      idCourse
    );
    res.status(200).json({
      id: id_course,
      name,
      session
    });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(
  req: Request,
  res: Response<{ id: number }>,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const { name } = req.body as CourseCreateDto;
  try {
    const { id_course } = await courseService.createCourse(idTeacher, name);
    res.status(201).json({ id: id_course });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const { idCourse } = req.params;
  const fields = req.body as CourseUpdateDto;
  if (!Object.keys(fields).length)
    return res.status(400).json({ message: "No fields to update" });
  try {
    await updateCourseFromTeacher(idTeacher, idCourse, fields);
    res.status(200).json({ message: "Course updated successfully" });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: NextFunction
) {
  const { id: idTeacher } = req.user!;
  const { idCourse } = req.params;
  try {
    await deleteCourseFromTeacher(idTeacher, idCourse);
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
    await courseService.createSession(idTeacher, idCourse);
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
    await courseService.startSession(idTeacher, idCourse);
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
    await courseService.endSession(idTeacher, idCourse);
    res.status(200).json({ message: "Session ended successfully" });
  } catch (err) {
    next(err);
  }
}
