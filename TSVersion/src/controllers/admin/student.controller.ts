import { Student, StudentCreation } from "@interfaces/Student.types";
import crudController from "@controllers/admin/_.controller";
import { StudentModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Student, StudentCreation, StudentModel>(StudentModel);
