import { Task, TaskCreation } from "@interfaces/Task.types";
import crudController from "@controllers/admin/_.controller";
import { TaskModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Task, TaskCreation, TaskModel>(TaskModel);
