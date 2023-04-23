import {
  Institution,
  InstitutionCreation
} from "@interfaces/Institution.types";
import crudController from "@controllers/admin/_.controller";
import { InstitutionModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Institution, InstitutionCreation, InstitutionModel>(
  InstitutionModel
);
