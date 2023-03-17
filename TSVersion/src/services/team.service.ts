import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TeamModel } from "../models";
import { Team } from "../types/Team.types";
import {
  createTaskAttempt,
  getStudCurrTaskAttempt,
  updateStudCurrTaskAttempt
} from "./taskAttempt.service";
import { getTaskByOrder } from "./task.service";
import { ApiError } from "../middlewares/handleErrors";
import { Student, TeamMember } from "../types/Student.types";
import { OutgoingEvents, Power } from "../types/enums";
import { Namespace, of } from "../listeners/sockets";
import { directory as directoryStudents } from "../listeners/namespaces/students";

export async function getTeamByCode(code: string): Promise<Team> {
  const team = await TeamModel.findOne({ where: { code } });
  if (!team) throw new ApiError("Team not found", 404);
  return team;
}

export async function getMembersFromTeam(teamInfo: {
  idTeam?: number;
  code?: string;
}): Promise<TeamMember[]> {
  const { idTeam, code } = teamInfo;
  if (!idTeam && !code)
    throw new ApiError("Must provide either idTeam or code", 400);

  interface TeamMemberRaw extends Student {
    blindness_acuity_name: string;
    blindness_acuity_level: number;
    id_task_attempt: number;
    power: Power | null;
  }
  const teamMembers = await sequelize.query<TeamMemberRaw>(
    `
        SELECT s.*, ba.name AS blindness_acuity_name, ba.level AS blindness_acuity_level, ta.id_task_attempt, ta.power
        FROM team t 
        JOIN task_attempt ta ON t.id_team = ta.id_team AND t.active = ta.active
        JOIN student s ON ta.id_student = s.id_student
        JOIN blindness_acuity ba ON ba.id_blindness_acuity = s.id_blindness_acuity
        WHERE ${idTeam ? `t.id_team = ${idTeam}` : `t.code = '${code}'`}
    `,
    { type: QueryTypes.SELECT }
  );
  return teamMembers.map(
    ({
      blindness_acuity_level,
      blindness_acuity_name,
      id_task_attempt,
      power,
      ...studentFields
    }) => ({
      ...studentFields,
      blindness_acuity: {
        level: blindness_acuity_level,
        name: blindness_acuity_name
      },
      task_attempt: {
        id: id_task_attempt,
        power
      }
    })
  );
}

export async function getTeamById(idTeam: number): Promise<Team> {
  const team = await TeamModel.findOne({ where: { id_team: idTeam } });
  if (!team) throw new ApiError("Team not found", 404);
  return team;
}

export async function getAvailablePowers(idTeam: number) {
  const members = await getMembersFromTeam({ idTeam });
  const powers = members.map(({ task_attempt }) => task_attempt.power);
  const availablePowers = Object.values(Power).filter(
    (power) => !powers.includes(power)
  );
  return availablePowers;
}

export async function createTeam(
  name: string,
  idCourse: number
): Promise<Team> {
  return await TeamModel.create({ name, id_course: idCourse }); // code is auto-generated; TODO: create again if code already exists?
}

export async function updateTeam(idTeam: number, fields: Partial<Team>) {
  if (fields.active === true)
    throw new ApiError("Cannot re-activate team", 400);
  await TeamModel.update(fields, { where: { id_team: idTeam } });
}

export async function addStudentToTeam(
  idStudent: number,
  idTeam: number,
  taskOrder: number
) {
  let currTaskAttempt;
  try {
    currTaskAttempt = await getStudCurrTaskAttempt(idStudent);
    console.log('1. currTaskAttempt', currTaskAttempt);
  } catch (err) {}

  if (currTaskAttempt) {
    await updateStudCurrTaskAttempt(idStudent, { id_team: idTeam });
  } else {
    console.log("Student has no task attempt, creating one...");
    const { id_task } = await getTaskByOrder(taskOrder);
    currTaskAttempt = await createTaskAttempt(idStudent, id_task, idTeam);
    console.log("Task attempt created", currTaskAttempt);
  }
}

export async function removeStudFromTeam(idStudent: number) {
  await updateStudCurrTaskAttempt(idStudent, { id_team: null });
}

export async function notifyTeamOfUpdate(idTeam: number, idStudent?: number) {
  let teamRoom;
  if (idStudent) {
    const studentSocket = directoryStudents.get(idStudent);
    if (!studentSocket) return;
    teamRoom = studentSocket.broadcast.to(`t${idTeam}`);
  } else {
    const channelStudents = of(Namespace.STUDENTS);
    if (!channelStudents) return;
    teamRoom = channelStudents.to(`t${idTeam}`);
  }
  const members = await getMembersFromTeam({ idTeam: idTeam });
  teamRoom.emit(OutgoingEvents.TEAM_UPDATE, {
    ...members.map((member) => ({
      id: member.id_student,
      firstName: member.first_name,
      lastName: member.last_name,
      username: member.username,
      power: member.task_attempt.power
    }))
  });
  // TODO: notify teacher
}
