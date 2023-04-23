import {
  ColorDeficiency,
  ColorDeficiencyCreation
} from "@interfaces/ColorDeficiency.types";
import crudController from "@controllers/admin/_.controller";
import { ColorDeficiencyModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<
    ColorDeficiency,
    ColorDeficiencyCreation,
    ColorDeficiencyModel
  >(ColorDeficiencyModel);

export const getColorDeficiency = getElement;
export const getColorDeficiencys = getElements;
export const createColorDeficiency = createElement;
export const updateColorDeficiency = updateElement;
export const deleteColorDeficiency = deleteElement;
