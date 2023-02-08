import { Model, ForeignKey } from "sequelize";

export interface Team {
    id_team: number;
    id_course: ForeignKey<number>;
    name: string;
    code: string;
    active: boolean;
};

export type TeamCreation = Omit<Team, 'id_team'>;

export interface TeamModel extends Model<Team, TeamCreation>, Team{};
