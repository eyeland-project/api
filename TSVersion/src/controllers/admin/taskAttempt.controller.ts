import {
  TaskAttempt,
  TaskAttemptCreation
} from "@interfaces/TaskAttempt.types";
import crudController from "@controllers/admin/_.controller";
import { TaskAttemptModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<TaskAttempt, TaskAttemptCreation, TaskAttemptModel>(
  TaskAttemptModel
);
