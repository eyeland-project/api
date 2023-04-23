import { Answer, AnswerCreation } from "@interfaces/Answer.types";
import crudController from "@controllers/admin/_.controller";
import { AnswerModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Answer, AnswerCreation, AnswerModel>(AnswerModel);
