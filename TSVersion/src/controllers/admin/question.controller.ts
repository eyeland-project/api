import { Question, QuestionCreation } from "@interfaces/Question.types";
import crudController from "@controllers/admin/_.controller";
import { QuestionModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Question, QuestionCreation, QuestionModel>(QuestionModel);
