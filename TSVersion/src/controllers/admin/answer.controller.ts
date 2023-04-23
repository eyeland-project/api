import { Answer, AnswerCreation } from "@interfaces/Answer.types";
import crudController from "@controllers/admin/_.controller";
import { AnswerModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Answer, AnswerCreation, AnswerModel>(AnswerModel);

export const getAnswer = getElement;
export const getAnswers = getElements;
export const createAnswer = createElement;
export const updateAnswer = updateElement;
export const deleteAnswer = deleteElement;
