import { emitTo } from "../listeners/namespaces/students";
import { OutgoingEvents } from "../types/enums";
import { getQuestionsFromTaskStageByTaskId } from "./question.service";
import { getPlayingTeamsFromCourse } from "./team.service";
interface Team {
  id: number;
  name: string;
  position: number;
}

const leaderBoards: Record<number, Team[]> = {};

export function getLeaderBoard(id: number): Team[] {
  return leaderBoards[id] || [];
}

//TODO: call the function in another places
export async function updateLeaderBoard(idCourse: number): Promise<void> {
  const teams = await getPlayingTeamsFromCourse(idCourse);
  console.log("teams", teams.length);
  if (!teams.length) {
    return;
  }

  /*
  console.log("teams", teams.length);
  /*/
  const numQuestions = (
    await getQuestionsFromTaskStageByTaskId(teams[0].taskAttempts[0].id_task, 1)
  ).length;
  //*

  // initialize the position
  let position = 0;

  // create the leaderboard
  const leaderboardScore = teams
    .map((team) => {
      // The score is proportional to the number of correct answers
      // The maximum score is 100 when all (or all - 1) answers are correct and the time is 0
      // const score = team.answers.reduce((acc, answer) => {
      const score =
        team.answers.reduce((acc, answer) => {
          const correct = answer.option.correct;

          return acc + (correct ? 90 / (numQuestions - 1) : 0);
        }, 0) + (team.answers.length >= numQuestions ? 10 : 0);

      return {
        id: team.id_team,
        name: team.name,
        score
      };
    })
    .sort((a, b) => b.score - a.score);

  console.log("leaderboard2", leaderboardScore);

  const leaderBoard = leaderboardScore.map((team, i, arr) => {
    // teams with the same score have the same position
    if (i > 0 && team.score === arr[i - 1].score) {
      return {
        id: team.id,
        name: team.name,
        position
      };
    } else {
      position = i + 1;

      return {
        id: team.id,
        name: team.name,
        position
      };
    }
  });

  console.log("leaderboard2", leaderBoard);
  // Check if the leaderboard has changed
  if (
    leaderBoards[idCourse] &&
    leaderBoards[idCourse].length === leaderBoard.length &&
    leaderBoards[idCourse].every((team, i) => team.id === leaderBoard[i].id)
  ) {
    return;
  }

  leaderBoards[idCourse] = leaderBoard;

  console.log("leaderboard", leaderBoard);

  emitTo(
    `c${idCourse}`,
    OutgoingEvents.LEADER_BOARD_UPDATE,
    leaderBoards[idCourse]
  );
  //*/
}
