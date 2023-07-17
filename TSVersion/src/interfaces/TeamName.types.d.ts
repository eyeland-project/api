export interface TeamName {
  id_team_name: number;
  name: string;
}

export type TeamNameCreation = Omit<TeamName, "id_team_name">;
