import { Release, ReleaseCreation } from "@interfaces/Release.types";
import crudController from "@controllers/admin/_.controller";
import { ReleaseModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Release, ReleaseCreation, ReleaseModel>(ReleaseModel);
