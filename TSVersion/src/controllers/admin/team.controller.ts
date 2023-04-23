import { Team, TeamCreation } from "@interfaces/Team.types";
import crudController from "@controllers/admin/_.controller";
import { TeamModel } from "@models";

export const {
  createElement,
  deleteElement,
  getElement,
  getElements,
  updateElement
} = crudController<Team, TeamCreation, TeamModel>(TeamModel);
