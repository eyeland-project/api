// import Team from "../models/Team";
// import { TeamModel } from "../types/Team.types";
// import { taskCount, getTaskQuestionsByOrder } from "./task.service";

// export async function disponibleTasks(idTeam: number): Promise<any> {
//     const team: TeamModel | null = await Team.findByPk(idTeam);

//     if (!team) throw Error('Group not found')
//     const numberOfTasks = await taskCount();
//     return {
//         "numberOfTasks": numberOfTasks,
//         "availableTasks": Math.min(team.availableTasks, numberOfTasks)
//     }
// }

// //! NEED TO BE FIXED WHEN HISTORIAL IS IMPLEMENTED
// export async function preguntasDisponibles(groupId: number, taskOrder: number): Promise<any> {
//     const group: TeamModel | null = await Team.findByPk(groupId);

//     if (!group) throw Error('Group not found')

//     const questions = (await getTaskQuestionsByOrder(taskOrder));

//     if (!questions) {
//         return null;
//     }

//     const numberOfQuestions = questions.length;
//     return {
//         "numberOfQuestions": numberOfQuestions,
//         "availableQuestions": numberOfQuestions
//     }
// }
