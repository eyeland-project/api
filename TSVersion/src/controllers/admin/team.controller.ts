import { Team, TeamCreation } from "@interfaces/Team.types";
import crudController from "@controllers/admin/_.controller";
import { TeamModel } from "@models";

const { createElement, deleteElement, getElement, getElements, updateElement } =
  crudController<Team, TeamCreation, TeamModel>(TeamModel);

export const getTeam = getElement;
export const getTeams = getElements;
export const createTeam = createElement;
export const updateTeam = updateElement;
export const deleteTeam = deleteElement;
