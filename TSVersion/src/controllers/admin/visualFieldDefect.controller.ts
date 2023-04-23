import {
  VisualFieldDefect,
  VisualFieldDefectCreation
} from "@interfaces/VisualFieldDefect.types";
import crudController from "@controllers/admin/_.controller";
import { VisualFieldDefectModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<
    VisualFieldDefect,
    VisualFieldDefectCreation,
    VisualFieldDefectModel
  >(VisualFieldDefectModel);

export const getVisualFieldDefect = getElement;
export const getVisualFieldDefects = getElements;
export const createVisualFieldDefect = createElement;
export const updateVisualFieldDefect = updateElement;
export const deleteVisualFieldDefect = deleteElement;
