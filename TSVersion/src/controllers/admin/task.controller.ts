import { Task, TaskCreation } from "@interfaces/Task.types";
import crudController from "@controllers/admin/_.controller";
import { TaskModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Task, TaskCreation, TaskModel>(TaskModel);

export const getTask = getElement;
export const getTasks = getElements;
export const createTask = createElement;
export const updateTask = updateElement;
export const deleteTask = deleteElement;
