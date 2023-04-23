import { Admin, AdminCreation } from "@interfaces/Admin.types";
import crudController from "@controllers/admin/_.controller";
import { AdminModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Admin, AdminCreation, AdminModel>(AdminModel);

export const getAdmin = getElement;
export const getAdmins = getElements;
export const createAdmin = createElement;
export const updateAdmin = updateElement;
export const deleteAdmin = deleteElement;
