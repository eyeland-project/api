import {
  GradeAnswer,
  GradeAnswerCreation
} from "@interfaces/GradeAnswer.types";
import crudController from "@controllers/admin/_.controller";
import { GradeAnswerModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<GradeAnswer, GradeAnswerCreation, GradeAnswerModel>(
  GradeAnswerModel
);
