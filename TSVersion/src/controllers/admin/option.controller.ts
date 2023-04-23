import { Option, OptionCreation } from "@interfaces/Option.types";
import crudController from "@controllers/admin/_.controller";
import { OptionModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Option, OptionCreation, OptionModel>(OptionModel);

export const getOption = getElement;
export const getOptions = getElements;
export const createOption = createElement;
export const updateOption = updateElement;
export const deleteOption = deleteElement;
