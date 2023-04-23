import { Student, StudentCreation } from "@interfaces/Student.types";
import crudController from "@controllers/admin/_.controller";
import { StudentModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Student, StudentCreation, StudentModel>(StudentModel);

export const getStudent = getElement;
export const getStudents = getElements;
export const createStudent = createElement;
export const updateStudent = updateElement;
export const deleteStudent = deleteElement;
