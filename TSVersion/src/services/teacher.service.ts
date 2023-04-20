import { ApiError } from "@middlewares/handleErrors";
import { CourseModel, InstitutionModel, TeacherModel } from "@models";
import { Teacher } from "@interfaces/Teacher.types";
import { Institution } from "@interfaces/Institution.types";
import { Course } from "@interfaces/Course.types";
import { CourseUpdateDto } from "@dto/teacher/course.dto";
import { deleteCourse, updateCourse } from "./course.service";

export async function getTeacherById(idTeacher: number): Promise<Teacher> {
  const teacher = await TeacherModel.findOne({
    where: { id_teacher: idTeacher }
  });
  if (!teacher) throw new ApiError("Teacher not found", 404);
  return teacher;
}

export async function getInstitutionFromTeacher(
  idTeacher: number
): Promise<Institution> {
  const teacher = await TeacherModel.findOne({
    where: { id_teacher: idTeacher },
    include: [
      {
        model: InstitutionModel,
        as: "institution"
      }
    ]
  });
  if (!teacher) throw new ApiError("Teacher not found", 404);
  return teacher.institution;
}

export async function getCoursesFromTeacher(
  idTeacher: number
): Promise<Course[]> {
  const courses = await CourseModel.findAll({
    where: { id_teacher: idTeacher, deleted: false }
  });
  return courses;
}

export async function getCourseFromTeacher(
  idTeacher: number,
  idCourse: number
): Promise<Course> {
  const course = await CourseModel.findOne({
    where: { id_course: idCourse, id_teacher: idTeacher, deleted: false }
  });
  if (!course) throw new ApiError("Course not found", 404);
  return course;
}

export async function updateCourseFromTeacher(
  idTeacher: number,
  idCourse: number,
  fields: CourseUpdateDto
) {
  await getCourseFromTeacher(idTeacher, idCourse); // Check if course is not "deleted" and belongs to teacher
  await updateCourse(idCourse, fields);
}

export async function deleteCourseFromTeacher(
  idTeacher: number,
  idCourse: number
) {
  await getCourseFromTeacher(idTeacher, idCourse); // Check if course is not "deleted" and belongs to teacher
  await deleteCourse(idCourse);
}
