import {
  StudentTask,
  StudentTaskCreation
} from "@interfaces/StudentTask.types";
import crudController from "@controllers/admin/_.controller";
import { StudentTaskModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<StudentTask, StudentTaskCreation, StudentTaskModel>(
  StudentTaskModel
);
