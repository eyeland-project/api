import { TeamDetailDto as TeamDetailDtoGlobal } from "@dto/global/team.dto";

export interface TeamDetailDto extends TeamDetailDtoGlobal {}

export interface TeamCreateDto {
  name: string;
}

export type TeamUpdateDto = Partial<TeamCreateDto & { active: false }>;
