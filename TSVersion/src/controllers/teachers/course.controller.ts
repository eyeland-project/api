import { Request, Response } from "express";
import {
    getCourseById,
    getCourses as getCoursesServ,
    createCourse as createCourseServ,
    updateCourse as updateCourseServ,
    deleteCourse as deleteCourseServ
} from "../../services/course.service";
import { CourseResp, CourseSummResp, ElementCreatedResp } from "../../types/responses/teachers.types";
import { CourseCreateReq, CourseUpdateReq } from "../../types/requests/teachers.types";
import { getTeacherById } from "../../services/teacher.service";

export async function getCourses(req: Request, res: Response<CourseSummResp[]>, next: Function) {
    try {
        const courses = await getCoursesServ();
        res.status(200).json(courses.map(({ id_course, name }) => ({
            id: id_course,
            name,
        })));
    } catch (err) {
        next(err);
    }
}

export async function getCourse(req: Request<{ idCourse: number }>, res: Response<CourseResp>, next: Function) {
    const { idCourse } = req.params;
    try {
        const course = await getCourseById(idCourse);
        const { id_course, name, description, session } = course;
        res.status(200).json({
            id: id_course,
            name,
            description: description || '',
            session
        });
    } catch (err) {
        next(err);
    }
}

export async function createCourse(req: Request, res: Response<ElementCreatedResp>, next: Function) {
    const { id: idTeacher } = req.user!;
    const { name, description } = req.body as CourseCreateReq;
    try {
        const { id_institution } = await getTeacherById(idTeacher);
        const { id_course } = await createCourseServ(name, description, idTeacher, id_institution);
        res.status(201).json({ id: id_course });
    } catch (err) {
        next(err);
    }
}

export async function updateCourse(req: Request<{ idCourse: number }>, res: Response, next: Function) {
    const { idCourse } = req.params;
    const fields = req.body as Partial<CourseUpdateReq>;
    try {
        await updateCourseServ(idCourse, fields);
        res.status(200).json({ message: 'Course updated successfully' });
        if (fields.session !== undefined) {
            if (fields.session) {
                // await startCourseSession(idCourse);
            } else {
                // await endCourseSession(idCourse);
            }
        }
    } catch (err) {
        next(err);
    }
}

export async function deleteCourse(req: Request<{ idCourse: number }>, res: Response, next: Function) {
    const { idCourse } = req.params;
    try {
        await deleteCourseServ(idCourse);
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        next(err);
    }
}
