import { TeamNameModel } from "@models";
import * as repositoryService from "@services/repository.service";

export async function generateTeamName(
  usedTeamName: string[] = []
): Promise<{ name: string; idTeamName: number }> {
  const teamNames = await repositoryService.findAll<TeamNameModel>(
    TeamNameModel
  );

  let count = 1;
  const teamName = teamNames[Math.floor(Math.random() * teamNames.length)];
  const teamNameBase = teamName.name;

  let name = teamNameBase + ` ${count}`;
  while (usedTeamName.includes(name)) {
    count++;
    name = `${teamNameBase} ${count}`;
  }
  return {
    name,
    idTeamName: teamName.id_team_name
  };
}
