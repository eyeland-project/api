import { Model, ForeignKey } from "sequelize";
import { Student } from "./Student.types";

export interface Team {
  id_team: number;
  id_course: number;
  name: string;
  code?: string | null;
  active: boolean;
  playing: boolean;
}

export interface TeamMember extends Student {
  task_attempt: {
    id: number;
    power: Power | null;
  };
  blindness_acuity_level: number;
  visual_field_defect_code: string;
  color_deficiency_code: string;
}

export type TeamCreation = Omit<Team, "id_team" | "active" | "playing">;
