import { Request, Response } from "express";
import {
  getCourseById,
  getCourses as getCoursesServ,
  createCourse as createCourseServ,
  updateCourse as updateCourseServ,
  deleteCourse as deleteCourseServ
} from "../../services/course.service";
import {
  CourseResp,
  CourseSummResp,
  ElementCreatedResp
} from "../../types/responses/teachers.types";
import {
  CourseCreateReq,
  CourseUpdateReq
} from "../../types/requests/teachers.types";
import { getTeacherById } from "../../services/teacher.service";
import { Namespaces, of } from "../../listeners/sockets";
import { OutgoingEvents } from "../../types/enums";
import { updateLeaderBoard } from "../../services/leaderBoard.service";

export async function getCourses(
  req: Request,
  res: Response<CourseSummResp[]>,
  next: Function
) {
  try {
    const courses = await getCoursesServ();
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
  next: Function
) {
  const { idCourse } = req.params;
  try {
    const course = await getCourseById(idCourse);
    const { id_course, name, description, session } = course;
    res.status(200).json({
      id: id_course,
      name,
      description: description || "",
      session
    });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(
  req: Request,
  res: Response<ElementCreatedResp>,
  next: Function
) {
  const { id: idTeacher } = req.user!;
  const { name, description } = req.body as CourseCreateReq;
  try {
    const { id_institution } = await getTeacherById(idTeacher);
    const { id_course } = await createCourseServ(
      name,
      description,
      idTeacher,
      id_institution
    );
    res.status(201).json({ id: id_course });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: Function
) {
  const { idCourse } = req.params;
  const fields = req.body as Partial<CourseUpdateReq>;

  if (!Object.keys(fields).length)
    return res.status(400).json({ message: "No fields to update" });
  try {
    await updateCourseServ(idCourse, fields);
    res.status(200).json({ message: "Course updated successfully" });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: Function
) {
  const { idCourse } = req.params;
  try {
    await deleteCourseServ(idCourse);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function createSession(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: Function
) {
  const { idCourse } = req.params;
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) {
    return res.status(500).json({ message: "Namespace not found" });
  }

  try {
    const { session, id_course } = await getCourseById(idCourse);
    if (session) {
      return res
        .status(400)
        .json({ message: "Course already has an active session" });
    }

    await updateCourseServ(idCourse, { session: true });
    nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_CREATE);
    res.status(201).json({ message: "Session created successfully" });
  } catch (err) {
    next(err);
  }
}

export async function startSession(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: Function
) {
  const { idCourse } = req.params;
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) {
    return res.status(500).json({ message: "Namespace not found" });
  }

  try {
    const { session, id_course } = await getCourseById(idCourse);
    if (!session) {
      return res.status(400).json({ message: "Course has no active session" });
    }

    nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_START);
    updateLeaderBoard(id_course);
    res.status(200).json({ message: "Session started successfully" });
  } catch (err) {
    next(err);
  }
}

export async function endSession(
  req: Request<{ idCourse: number }>,
  res: Response,
  next: Function
) {
  const { idCourse } = req.params;
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) {
    return res.status(500).json({ message: "Namespace not found" });
  }

  try {
    const { session, id_course } = await getCourseById(idCourse);
    if (!session) {
      return res.status(400).json({ message: "Course has no active session" });
    }

    await updateCourseServ(idCourse, { session: false });
    nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_END);
    res.status(200).json({ message: "Session ended successfully" });
  } catch (err) {
    next(err);
  }
}
