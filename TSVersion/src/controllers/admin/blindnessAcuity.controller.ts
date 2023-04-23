import {
  BlindnessAcuity,
  BlindnessAcuityCreation
} from "@interfaces/BlindnessAcuity.types";
import crudController from "@controllers/admin/_.controller";
import { BlindnessAcuityModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<
  BlindnessAcuity,
  BlindnessAcuityCreation,
  BlindnessAcuityModel
>(BlindnessAcuityModel);
