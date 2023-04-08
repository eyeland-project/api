import { Op, QueryTypes } from "sequelize";
import sequelize from "../database/db";
import {
  AnswerModel,
  OptionModel,
  TaskAttemptModel,
  TeamModel
} from "../models";
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
import { directory as directoryStudents } from "../listeners/namespaces/students";
import { TaskAttempt } from "../types/TaskAttempt.types";
import { assignPowerToStudent, getTeamFromStudent } from "./student.service";
import { notifyCourseOfTeamUpdate } from "./course.service";
import { Socket } from "socket.io";

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
        JOIN task_attempt ta ON t.id_team = ta.id_team AND (t.active = ta.active OR t.active = false)
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

export async function createTeams(
  names: string[],
  idCourse: number
): Promise<Team[]> {
  const teams = await Promise.all(
    names.map((name) => createTeam(name, idCourse))
  );
  return teams;
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
    // console.log("1. currTaskAttempt", currTaskAttempt);
  } catch (err) {}

  if (currTaskAttempt) {
    await updateStudCurrTaskAttempt(idStudent, { id_team: idTeam });
  } else {
    console.log("Student has no task attempt, creating one...");
    const { id_task } = await getTaskByOrder(taskOrder);
    currTaskAttempt = await createTaskAttempt(idStudent, id_task, idTeam);
    // console.log("Task attempt created", currTaskAttempt);
  }
}

export async function leaveTeam(
  idStudent: number,
  socketStudent: Socket
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const power = (await getStudCurrTaskAttempt(idStudent)).power;
      const { id_team, id_course } = await getTeamFromStudent(idStudent); // check if student is already in a team
      await removeStudFromTeam(idStudent);
      resolve();

      try {
        socketStudent.leave("t" + id_team); // leave student from team socket room
        // check if this student had super_hearing to assign it to another student
        checkReassignSuperHearing(id_team, power).catch((err) => {
          console.log(err);
        });
  
        await verifyTeamStatus(id_team);
        notifyCourseOfTeamUpdate(id_course, id_team, idStudent);
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export async function checkReassignSuperHearing(
  idTeam: number,
  powerOldStudent: Power | null | undefined
) {
  if (powerOldStudent !== Power.SUPER_HEARING) return; // no need to reassign
  const teammates = await getMembersFromTeam({ idTeam });
  if (!teammates.length) return; // no teammates left

  const blindnessLevels = teammates.map(
    ({ blindness_acuity: { level } }) => level
  );
  const maxBlindnessLevel = Math.max(...blindnessLevels);
  if (maxBlindnessLevel === 0) return; // no teammates with blindness

  const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
  const { id_student: idNewStudent } = teammates[withMaxBlindnessIdx];
  await assignPowerToStudent(idNewStudent, Power.SUPER_HEARING, teammates);
  notifyStudentOfTeamUpdate(idNewStudent);
}

export async function removeStudFromTeam(idStudent: number) {
  await updateStudCurrTaskAttempt(idStudent, { id_team: null });
}

export async function notifyStudentOfTeamUpdate(idStudent: number) {
  const studentSocket = directoryStudents.get(idStudent);
  if (!studentSocket) return;
  const { power } = await getStudCurrTaskAttempt(idStudent);
  studentSocket.emit(OutgoingEvents.TEAM_UPDATE, {
    power
  });
  // TODO: notify teacher
}

export async function getTaskAttemptsFromTeam(
  idTeam: number
): Promise<TaskAttempt[]> {
  return await TaskAttemptModel.findAll({ where: { id_team: idTeam } });
}

export async function getPlayingTeamsFromCourse(
  idCourse: number
): Promise<TeamModel[]> {
  // return all active teams that have at least one student with a task attempt
  const teams = await TeamModel.findAll({
    where: { id_course: idCourse, active: true, playing: true },
    include: [
      {
        model: TaskAttemptModel,
        required: true,
        where: { id_team: { [Op.ne]: null }, active: true },
        as: "taskAttempts"
      },
      {
        model: AnswerModel,
        as: "answers",
        include: [
          "question",
          {
            model: OptionModel,
            as: "option"
          }
        ]
      }
    ]
  });
  return teams;
}

export async function verifyTeamStatus(teamId: number) {
  const team = await TeamModel.findOne({
    where: { id_team: teamId },
    include: [
      {
        model: TaskAttemptModel,
        as: "taskAttempts"
      },
      {
        model: AnswerModel,
        as: "answers"
      }
    ]
  });

  if (!team) return;

  if (!team.active) return;

  const hasActiveTaskAttempt = team.taskAttempts.some(
    ({ active }) => active === true
  );
  if (hasActiveTaskAttempt) return;
  if (team.playing) {
    team.playing = false;
  }
  const hasAnswer = team.answers.length > 0;
  if (hasAnswer) {
    team.active = false;
  }
  await team.save();
}

export async function startPlayingTeams(idCourse: number) {
  // update all teams that have at least one student with an active task attempt
  const teams = await TeamModel.findAll({
    where: { id_course: idCourse, active: true },
    include: [
      {
        model: TaskAttemptModel,
        required: true,
        where: { id_team: { [Op.ne]: null }, active: true },
        as: "taskAttempts"
      }
    ]
  });

  for (const team of teams) {
    team.playing = true;
    await team.save();
  }

  return teams;
}

export async function cleanTeams(idCourse: number) {
  // get all teams that have active task attempts or answers
  const teams = (
    await TeamModel.findAll({
      where: { id_course: idCourse, active: true },
      include: [
        {
          model: TaskAttemptModel,
          as: "taskAttempts",
          where: { active: true }
        },
        {
          model: AnswerModel,
          as: "answers"
        }
      ]
    })
  ).filter((team) => team.taskAttempts.length > 0 || team.answers.length > 0);

  const promises: Promise<any>[] = [];
  for (const team of teams) {
    team.active = false;
    team.playing = false;
    promises.push(team.save());
  }

  await Promise.all(promises);
}

export function getActiveTeamsFromCourse(idCourse: number) {
  return TeamModel.findAll({
    where: { id_course: idCourse, active: true },
    include: [
      {
        model: TaskAttemptModel,
        as: "taskAttempts"
      },
      {
        model: AnswerModel,
        as: "answers"
      }
    ]
  });
}
