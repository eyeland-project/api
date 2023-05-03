import { Op, QueryTypes } from "sequelize";
import sequelize from "@database/db";
import {
  AnswerModel,
  BlindnessAcuityModel,
  OptionModel,
  StudentModel,
  TaskAttemptModel,
  TaskModel,
  TeamModel
} from "@models";
import { Team } from "@interfaces/Team.types";
import {
  createTaskAttempt,
  getCurrTaskAttempt,
  updateCurrTaskAttempt
} from "@services/taskAttempt.service";
import { ApiError } from "@middlewares/handleErrors";
import { Student } from "@interfaces/Student.types";
import { TeamMember } from "@interfaces/Team.types";
import { Power } from "@interfaces/enums/taskAttempt.enum";
import { OutgoingEvents } from "@interfaces/enums/socket.enum";
import {
  directory as directoryStudents,
  emitTo as toStudentRoom
} from "@listeners/namespaces/student";
import { TaskAttempt } from "@interfaces/TaskAttempt.types";
import {
  assignPowerToStudent,
  getTeamFromStudent,
  whoami
} from "@services/student.service";
import {
  filterTeamsForStudents,
  getTeamsFromCourseWithStudents,
  notifyCourseOfTeamUpdate
} from "@services/course.service";
import { Socket } from "socket.io";
import * as repositoryService from "@services/repository.service";
import { getHighestTaskCompletedFromStudent } from "@services/studentTask.service";
import { TeamDetailDto as TeamDetailDtoStudent } from "@dto/student/team.dto";
import { TeamDetailDto as TeamDetailDtoTeacher } from "@dto/teacher/team.dto";

export async function getTeamsForStudent(
  idStudent: number
): Promise<TeamDetailDtoStudent[]> {
  const { id_course } = await repositoryService.findOne<StudentModel>(
    StudentModel,
    { where: { id_student: idStudent } }
  );
  return filterTeamsForStudents(
    await getTeamsFromCourseWithStudents(id_course, {
      active: true,
      playing: false
    })
  );
}

export async function getTeamsForTeacher(
  idCourse: number,
  active: boolean
): Promise<TeamDetailDtoTeacher[]> {
  return await getTeamsFromCourseWithStudents(idCourse, { active });
}

export async function getTeamForTeacher(
  idCourse: number,
  idTeam: number
): Promise<TeamDetailDtoTeacher> {
  const teams = await getTeamsFromCourseWithStudents(
    idCourse,
    {
      id_team: idTeam
    },
    { limit: 1 }
  );
  if (teams.length === 0) throw new ApiError("Team not found", 404);
  return teams[0];
}

export async function joinTeam(
  idStudent: number,
  code: string,
  taskOrder: number
) {
  const socket = directoryStudents.get(idStudent);
  if (!socket) {
    throw new ApiError("Student is not connected", 400);
  }
  const nextTaskOrder =
    ((await getHighestTaskCompletedFromStudent(idStudent))?.task_order || 0) +
    1;
  if (taskOrder > nextTaskOrder) {
    throw new ApiError(`You should first complete task ${nextTaskOrder}`, 400);
  }

  let currTaskAttempt: TaskAttemptModel | undefined;
  try {
    currTaskAttempt = await repositoryService.findOne<TaskAttemptModel>(
      TaskAttemptModel,
      {
        where: { id_student: idStudent, active: true },
        include: [
          {
            model: TeamModel,
            as: "team",
            attributes: ["id_team"],
            required: false
          }
        ]
      }
    );
  } catch (err) {} // no team found for student (expected)

  const prevTeamId = currTaskAttempt?.team?.id_team;
  const team = await repositoryService.findOne<TeamModel>(TeamModel, {
    where: { code }
  });
  if (team.id_team === prevTeamId) {
    throw new ApiError("Student is already in this team", 400);
  }

  const student = await repositoryService.findOne<StudentModel>(StudentModel, {
    where: { id_student: idStudent },
    include: [
      {
        model: BlindnessAcuityModel,
        as: "blindnessAcuity",
        attributes: ["level"]
      }
    ]
  });
  if (student.id_course !== team.id_course) {
    throw new ApiError("Student and team are not in the same course", 400);
  }
  if (!team.active) {
    throw new ApiError("Team is not active", 400);
  }

  const teammates = await getMembersFromTeam({ idTeam: team.id_team });
  if (teammates.length >= 3) {
    throw new ApiError("Team is full", 400);
  }

  if (teammates.length) {
    // check if the team is already working on a different task
    const { id_task } = await getCurrTaskAttempt(teammates[0].id_student);
    const { task_order: taskOrderTeam } =
      await repositoryService.findOne<TaskModel>(TaskModel, {
        where: { id_task }
      });
    if (taskOrderTeam !== taskOrder) {
      throw new ApiError(
        "This team is already working on a different task",
        400
      );
    }
  }

  if (currTaskAttempt) {
    await updateCurrTaskAttempt(idStudent, { id_team: team.id_team });
  } else {
    console.log("Student has no task attempt, creating one...");
    const { id_task } = await repositoryService.findOne<TaskModel>(TaskModel, {
      where: { task_order: taskOrder }
    });
    currTaskAttempt = await createTaskAttempt(idStudent, id_task, team.id_team);
  }

  new Promise(() => {
    socket.join("t" + team.id_team); // join student to team socket room

    assignPowerToStudent(
      idStudent,
      "auto",
      teammates,
      student.blindnessAcuity.level,
      false
    )
      .then(({ yaper }) => {
        notifyCourseOfTeamUpdate(
          student.id_course,
          team.id_team,
          idStudent
        ).catch(() => {});
        if (yaper) notifyStudentOfTeamUpdate(yaper);
      })
      .catch(console.log);

    if (prevTeamId && currTaskAttempt) {
      checkReassignSuperHearing(prevTeamId, currTaskAttempt.power).catch(
        console.log
      );
    }
  }).catch(console.log);
}

export async function getMembersFromTeam(teamInfo: {
  idTeam?: number;
  code?: string;
}): Promise<TeamMember[]> {
  const { idTeam, code } = teamInfo;
  if (!idTeam && !code)
    throw new ApiError("Must provide either idTeam or code", 400);

  interface TeamMemberRaw extends Student {
    blindness_acuity_level: number;
    visual_field_defect_code: string;
    color_deficiency_code: string;
    id_task_attempt: number;
    power: Power | null;
  }
  const teamMembers = await sequelize.query<TeamMemberRaw>(
    `
        SELECT s.*, ba.level AS blindness_acuity_level, vfd.code AS visual_field_defect_code, cd.code AS color_deficiency_code, ta.id_task_attempt, ta.power
        FROM team t 
        JOIN task_attempt ta ON t.id_team = ta.id_team AND (t.active = ta.active OR t.active = false)
        JOIN student s ON ta.id_student = s.id_student
        JOIN blindness_acuity ba ON ba.id_blindness_acuity = s.id_blindness_acuity
        JOIN visual_field_defect vfd ON vfd.id_visual_field_defect = s.id_visual_field_defect
        JOIN color_deficiency cd ON cd.id_color_deficiency = s.id_color_deficiency
        WHERE ${idTeam ? `t.id_team = ${idTeam}` : `t.code = '${code}'`}
    `,
    { type: QueryTypes.SELECT }
  );
  return teamMembers.map(
    ({
      blindness_acuity_level,
      color_deficiency_code,
      visual_field_defect_code,
      id_task_attempt,
      power,
      ...studentFields
    }) => ({
      ...studentFields,
      blindness_acuity_level,
      color_deficiency_code,
      visual_field_defect_code,
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

export async function leaveTeamService(idStudent: number): Promise<void> {
  const socketStudent = directoryStudents.get(idStudent);
  if (!socketStudent) {
    throw new ApiError("Student is not connected", 400);
  }
  await leaveTeam(idStudent, socketStudent);
}

export async function leaveTeam(
  idStudent: number,
  socketStudent: Socket
): Promise<void> {
  const { power } = await getCurrTaskAttempt(idStudent);
  const { id_team, id_course, playing } = await getTeamFromStudent(idStudent); // check if student is already in a team
  await removeStudentFromTeam(idStudent);

  new Promise(async () => {
    socketStudent.leave("t" + id_team); // leave student from team socket room
    // check if this student had super_hearing to assign it to another student
    if (!playing) {
      checkReassignSuperHearing(id_team, power).catch((err) => {
        console.log(err);
      });
    } else {
      notifyDisconnection(id_team, idStudent);
    }
    await verifyTeamStatus(id_team);

    await notifyCourseOfTeamUpdate(id_course, id_team, idStudent);
  }).catch(console.log);
}

async function notifyDisconnection(id_team: number, id_student: number) {
  const { firstName } = await whoami(id_student);

  toStudentRoom(`t${id_team}`, OutgoingEvents.STUDENT_LEAVE, {
    name: firstName
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
    ({ blindness_acuity_level }) => blindness_acuity_level
  );
  const maxBlindnessLevel = Math.max(...blindnessLevels);
  if (maxBlindnessLevel === 0) return; // no teammates with blindness

  const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
  const { id_student: idNewStudent } = teammates[withMaxBlindnessIdx];
  await assignPowerToStudent(idNewStudent, Power.SUPER_HEARING, teammates);
  notifyStudentOfTeamUpdate(idNewStudent);
}

export async function removeStudentFromTeam(idStudent: number) {
  await updateCurrTaskAttempt(idStudent, { id_team: null });
}

export async function notifyStudentOfTeamUpdate(idStudent: number) {
  const studentSocket = directoryStudents.get(idStudent);
  if (!studentSocket) return;
  const { power } = await getCurrTaskAttempt(idStudent);
  studentSocket.emit(OutgoingEvents.TEAM_UPDATE, {
    power
  });
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
  const team = await repositoryService.findOne<TeamModel>(TeamModel, {
    where: { id_team: teamId },
    include: [
      {
        model: TaskAttemptModel,
        as: "taskAttempts",
        attributes: ["active"]
      },
      {
        model: AnswerModel,
        as: "answers",
        attributes: ["id_answer"]
      }
    ]
  });
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
  const promises: Promise<any>[] = [];
  const teams = (
    await TeamModel.findAll({
      where: { id_course: idCourse, active: true },
      include: [
        {
          model: TaskAttemptModel,
          as: "taskAttempts",
          where: { active: true },
          required: false,
          attributes: ["active", "id_student"]
        },
        {
          model: AnswerModel,
          as: "answers",
          attributes: ["id_answer"]
        }
      ]
    })
  )
    .filter(
      (team) =>
        team.taskAttempts.length > 0 || team.answers.length > 0 || team.playing
    )
    .filter((team) => {
      const activeTaskAttempts = team.taskAttempts.filter(
        ({ active }) => active
      );
      const hasAnswers = team.answers.length > 0;
      const hasStudentsWithSockets = team.taskAttempts.some(({ id_student }) =>
        directoryStudents.has(id_student)
      );

      if (hasAnswers || hasStudentsWithSockets) return true;

      if (activeTaskAttempts.length > 0) {
        promises.push(
          ...activeTaskAttempts.map((taskAttempt) => {
            taskAttempt.id_team = null;
            return taskAttempt.save();
          })
        );
      }

      if (team.playing) {
        team.playing = false;
        promises.push(team.save());
      }

      return false;
    });

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
