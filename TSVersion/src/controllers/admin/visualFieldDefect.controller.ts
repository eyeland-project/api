import {
  VisualFieldDefect,
  VisualFieldDefectCreation
} from "@interfaces/VisualFieldDefect.types";
import crudController from "@controllers/admin/_.controller";
import { VisualFieldDefectModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<
  VisualFieldDefect,
  VisualFieldDefectCreation,
  VisualFieldDefectModel
>(VisualFieldDefectModel);
