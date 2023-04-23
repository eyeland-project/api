import { Course, CourseCreation } from "@interfaces/Course.types";
import crudController from "@controllers/admin/_.controller";
import { CourseModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Course, CourseCreation, CourseModel>(CourseModel);

export const getCourse = getElement;
export const getCourses = getElements;
export const createCourse = createElement;
export const updateCourse = updateElement;
export const deleteCourse = deleteElement;
