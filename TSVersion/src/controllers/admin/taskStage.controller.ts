import { TaskStage, TaskStageCreation } from "@interfaces/TaskStage.types";
import crudController from "@controllers/admin/_.controller";
import { TaskStageModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<TaskStage, TaskStageCreation, TaskStageModel>(TaskStageModel);

export const getTaskStage = getElement;
export const getTaskStages = getElements;
export const createTaskStage = createElement;
export const updateTaskStage = updateElement;
export const deleteTaskStage = deleteElement;
