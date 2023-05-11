import { Teacher, TeacherCreation } from "@interfaces/Teacher.types";
import crudController from "@controllers/admin/_.controller";
import { TeacherModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Teacher, TeacherCreation, TeacherModel>(TeacherModel);
