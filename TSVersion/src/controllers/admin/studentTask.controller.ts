import {
  StudentTask,
  StudentTaskCreation
} from "@interfaces/StudentTask.types";
import crudController from "@controllers/admin/_.controller";
import { StudentTaskModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<StudentTask, StudentTaskCreation, StudentTaskModel>(
    StudentTaskModel
  );

export const getStudentTask = getElement;
export const getStudentTasks = getElements;
export const createStudentTask = createElement;
export const updateStudentTask = updateElement;
export const deleteStudentTask = deleteElement;
