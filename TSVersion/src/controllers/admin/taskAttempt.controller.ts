import {
  TaskAttempt,
  TaskAttemptCreation
} from "@interfaces/TaskAttempt.types";
import crudController from "@controllers/admin/_.controller";
import { TaskAttemptModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<TaskAttempt, TaskAttemptCreation, TaskAttemptModel>(
    TaskAttemptModel
  );

export const getTaskAttempt = getElement;
export const getTaskAttempts = getElements;
export const createTaskAttempt = createElement;
export const updateTaskAttempt = updateElement;
export const deleteTaskAttempt = deleteElement;
