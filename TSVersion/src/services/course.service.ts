import { ApiError } from "../middlewares/handleErrors";
import { CourseModel } from "../models";
import { Course } from "../types/database/Course.types";

export async function getCourseById(idCourse: number): Promise<Course> {
    const course = await CourseModel.findOne({ where: { id_course: idCourse } });
    if (!course) throw new ApiError("Course not found", 404);
    return course;
}

export async function startCourseSession(idCourse: number) {
    await CourseModel.update({ session: true }, { where: { id_course: idCourse } });
}

export async function endCourseSession(idCourse: number) {
    await CourseModel.update({ session: false }, { where: { id_course: idCourse } });
}
