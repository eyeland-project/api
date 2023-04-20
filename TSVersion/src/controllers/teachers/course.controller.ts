import { Request, Response, NextFunction } from "express";
import * as courseService from "@services/course.service";
import {
  CourseResp,
  CourseSummResp,
  CourseCreateReq,
  CourseUpdateReq
} from "@dto/teacher/course.dto";
import { getTeacherById } from "@services/teacher.service";

export async function getCourses(
  _: Request,
  res: Response<CourseSummResp[]>,
  next: NextFunction
) {
  try {
    const courses = await courseService.getCourses();
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
  res: Response<CourseResp>,
  next: NextFunction
) {
  const { idCourse } = req.params;
  try {
    const course = await courseService.getCourseById(idCourse);
    const { id_course, name, session } = course;
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
  const { name, description } = req.body as CourseCreateReq;
  try {
    const { id_institution } = await getTeacherById(idTeacher);
    const { id_course } = await courseService.createCourse({
      name,
      description,
      id_teacher: idTeacher,
      id_institution
    });
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
  const { idCourse } = req.params;
  const fields = req.body as Partial<CourseUpdateReq>;

  if (!Object.keys(fields).length)
    return res.status(400).json({ message: "No fields to update" });
  try {
    await courseService.updateCourse(idCourse, fields);
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
  const { idCourse } = req.params;
  try {
    await courseService.deleteCourse(idCourse);
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
  const { idCourse } = req.params;
  try {
    await courseService.createSession(idCourse);
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
  const { idCourse } = req.params;
  try {
    await courseService.startSession(idCourse);
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
  const { idCourse } = req.params;
  try {
    await courseService.endSession(idCourse);
    res.status(200).json({ message: "Session ended successfully" });
  } catch (err) {
    next(err);
  }
}
