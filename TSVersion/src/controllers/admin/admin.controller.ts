import { Admin, AdminCreation } from "@interfaces/Admin.types";
import crudController from "@controllers/admin/_.controller";
import { AdminModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Admin, AdminCreation, AdminModel>(AdminModel);
