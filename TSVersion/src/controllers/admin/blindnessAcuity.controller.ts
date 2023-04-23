import {
  BlindnessAcuity,
  BlindnessAcuityCreation
} from "@interfaces/BlindnessAcuity.types";
import crudController from "@controllers/admin/_.controller";
import { BlindnessAcuityModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<
    BlindnessAcuity,
    BlindnessAcuityCreation,
    BlindnessAcuityModel
  >(BlindnessAcuityModel);

export const getBlindnessAcuity = getElement;
export const getBlindnessAcuitys = getElements;
export const createBlindnessAcuity = createElement;
export const updateBlindnessAcuity = updateElement;
export const deleteBlindnessAcuity = deleteElement;
