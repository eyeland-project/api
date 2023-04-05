import { emitTo } from "../listeners/sockets";
import { AnswerModel, TeamModel } from "../models";
interface Team {
  id: number;
  name: string;
  score: number;
}

const leaderBoards: Record<number, Team[]> = {};

export function getLeaderBoard(id: number): Team[] {
  return leaderBoards[id] || [];
}

//TODO: call the function in another places
export async function updateLeaderBoard(id: number): Promise<void> {
  const teams = await TeamModel.findAll({
    where: {
      id_course: id
    },
    include: {
      model: AnswerModel,
      as: "answers",
      include: ["question"]
    }
  });

  const leaderboard = teams.map((team) => {
    const score = team.answers.reduce((acc, answer) => {
      return acc > answer.question.question_order
        ? acc
        : answer.question.question_order;
      return acc;
    }, -1);

    return {
      id: team.id_team,
      name: team.name,
      score
    };
  });

  leaderboard.sort((a, b) => b.score - a.score);

  // Check if the leaderboard has changed
  if (
    leaderBoards[id] &&
    leaderBoards[id].length === leaderboard.length &&
    leaderBoards[id].every((team, i) => team.id === leaderboard[i].id)
  ) {
    return;
  }

  // TODO: emit event to notify clients
  emitTo(`c${id}`, "course:leaderboard:update", leaderBoards[id]);
}
