import { TaskStage, TaskStageCreation } from "@interfaces/TaskStage.types";
import crudController from "@controllers/admin/_.controller";
import { TaskStageModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<TaskStage, TaskStageCreation, TaskStageModel>(
  TaskStageModel
);
