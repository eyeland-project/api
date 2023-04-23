import { Release, ReleaseCreation } from "@interfaces/Release.types";
import crudController from "@controllers/admin/_.controller";
import { ReleaseModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Release, ReleaseCreation, ReleaseModel>(ReleaseModel);

export const getRelease = getElement;
export const getReleases = getElements;
export const createRelease = createElement;
export const updateRelease = updateElement;
export const deleteRelease = deleteElement;
