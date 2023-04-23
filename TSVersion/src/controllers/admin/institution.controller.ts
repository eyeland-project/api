import {
  Institution,
  InstitutionCreation
} from "@interfaces/Institution.types";
import crudController from "@controllers/admin/_.controller";
import { InstitutionModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Institution, InstitutionCreation, InstitutionModel>(
    InstitutionModel
  );

export const getInstitution = getElement;
export const getInstitutions = getElements;
export const createInstitution = createElement;
export const updateInstitution = updateElement;
export const deleteInstitution = deleteElement;
