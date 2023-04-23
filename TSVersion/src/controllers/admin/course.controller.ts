import { Course, CourseCreation } from "@interfaces/Course.types";
import crudController from "@controllers/admin/_.controller";
import { CourseModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Course, CourseCreation, CourseModel>(CourseModel);
