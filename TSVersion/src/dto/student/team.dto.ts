import { TeamDetailDto as TeamDetailDtoGlobal } from "@dto/global/team.dto";

export type TeamDetailDto = Omit<TeamDetailDtoGlobal, "playing" | "active">;

export interface JoinTeamDto {
  code: string;
  taskOrder: number;
}
