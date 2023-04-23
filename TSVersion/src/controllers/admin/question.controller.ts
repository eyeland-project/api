import { Question, QuestionCreation } from "@interfaces/Question.types";
import crudController from "@controllers/admin/_.controller";
import { QuestionModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Question, QuestionCreation, QuestionModel>(QuestionModel);

export const getQuestion = getElement;
export const getQuestions = getElements;
export const createQuestion = createElement;
export const updateQuestion = updateElement;
export const deleteQuestion = deleteElement;
