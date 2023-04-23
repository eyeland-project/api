import {
  ColorDeficiency,
  ColorDeficiencyCreation
} from "@interfaces/ColorDeficiency.types";
import crudController from "@controllers/admin/_.controller";
import { ColorDeficiencyModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<
  ColorDeficiency,
  ColorDeficiencyCreation,
  ColorDeficiencyModel
>(ColorDeficiencyModel);
