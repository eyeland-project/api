import { Model, ForeignKey } from "sequelize";

export interface Team {
    id_team: number;
    id_course: number;
    name: string;
    code?: string;
    active: boolean;
};

export type TeamCreation = Omit<Team, 'id_team'>;
