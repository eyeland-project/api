import { Option, OptionCreation } from "@interfaces/Option.types";
import crudController from "@controllers/admin/_.controller";
import { OptionModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Option, OptionCreation, OptionModel>(OptionModel);
