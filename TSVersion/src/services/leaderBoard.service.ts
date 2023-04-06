import { emitTo } from "../listeners/sockets";
import {
  AnswerModel,
  OptionModel,
  TaskAttemptModel,
  TeamModel
} from "../models";
import { OutgoingEvents } from "../types/enums";
import { getQuestionsFromTaskStageByTaskId } from "./question.service";
import { getPlayingTeamsFromCourse } from "./team.service";
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
export async function updateLeaderBoard(idCourse: number): Promise<void> {
  const teams = await getPlayingTeamsFromCourse(idCourse);

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
  const leaderboard = teams.map((team) => {
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
  });

  leaderboard.sort((a, b) => b.score - a.score);

  // Check if the leaderboard has changed
  if (
    leaderBoards[idCourse] &&
    leaderBoards[idCourse].length === leaderboard.length &&
    leaderBoards[idCourse].every((team, i) => team.id === leaderboard[i].id)
  ) {
    return;
  }

  console.log("leaderboard", leaderboard);

  emitTo(
    `c${idCourse}`,
    OutgoingEvents.LEADER_BOARD_UPDATE,
    leaderBoards[idCourse]
  );
  //*/
}
