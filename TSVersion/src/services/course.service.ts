import { FindOptions, Op, QueryTypes } from "sequelize";
import sequelize from "@database/db";
import { ApiError } from "@middlewares/handleErrors";
import {
  BlindnessAcuityModel,
  CourseModel,
  StudentModel,
  TaskAttemptModel,
  TaskModel,
  TeacherModel,
  TeamModel
} from "@models";
import { Namespaces, of } from "@listeners/sockets";
import { OutgoingEvents } from "@interfaces/enums/socket.enum";
import { generateTeamName } from "@utils";
import { TeamDetailDto as TeamDetailDtoGlobal } from "@dto/global/team.dto";
import { TeamDetailDto as TeamDetailDtoTeacher } from "@dto/teacher/team.dto";
import { TeamDetailDto as TeamDetailDtoStudent } from "@dto/student/team.dto";
import { directory as directoryStudents } from "@listeners/namespaces/student";
import { directory as directoryTeachers } from "@listeners/namespaces/teacher";
import {
  cleanLeaderBoard,
  emitLeaderboard,
  updateLeaderBoard
} from "@services/leaderBoard.service";
import {
  cleanTeams,
  createTeams,
  getActiveTeamsFromCourse,
  startPlayingTeams
} from "@services/team.service";
import {
  CourseCreateDto,
  CourseDetailDto,
  CourseSummaryDto,
  CourseUpdateDto
} from "@dto/teacher/course.dto";
import * as repositoryService from "@services/repository.service";
import { Team } from "@interfaces/Team.types";
import { finishCourseTaskAttempts } from "@services/taskAttempt.service";

export async function getCourses(
  idTeacher: number
): Promise<CourseSummaryDto[]> {
  return (
    await repositoryService.findAll<CourseModel>(CourseModel, {
      where: { id_teacher: idTeacher, deleted: false }
    })
  ).map(({ id_course, name }) => ({
    id: id_course,
    name
  }));
}

export async function getCourse(
  idTeacher: number,
  idCourse: number
): Promise<CourseDetailDto> {
  const { name, session } = await repositoryService.findOne<CourseModel>(
    CourseModel,
    {
      where: { id_teacher: idTeacher, id_course: idCourse, deleted: false }
    }
  );
  return {
    id: idCourse,
    name,
    session
  };
}

export async function createCourse(
  idTeacher: number,
  fields: CourseCreateDto
): Promise<{ id: number }> {
  const { id_institution } = await repositoryService.findOne<TeacherModel>(
    TeacherModel,
    {
      where: { id_teacher: idTeacher }
    }
  );
  const { id_course } = await repositoryService.create<CourseModel>(
    CourseModel,
    {
      ...fields,
      id_teacher: idTeacher,
      id_institution
    }
  );
  return { id: id_course };
}

export async function updateCourse(
  idTeacher: number,
  idCourse: number,
  fields: CourseUpdateDto
) {
  // check if course exists and belongs to teacher
  await repositoryService.findOne<CourseModel>(CourseModel, {
    where: { id_course: idCourse, id_teacher: idTeacher, deleted: false }
  });
  // update course
  await repositoryService.update<CourseModel>(CourseModel, fields, {
    where: { id_course: idCourse }
  });
}

export async function deleteCourse(idTeacher: number, idCourse: number) {
  // check if course exists and belongs to teacher
  await repositoryService.findOne<CourseModel>(CourseModel, {
    where: { id_course: idCourse, id_teacher: idTeacher, deleted: false }
  });
  // delete course
  await repositoryService.update<CourseModel>(
    CourseModel,
    { deleted: true },
    {
      where: { id_course: idCourse }
    }
  );
}

// OTHERS
export async function getTeamsFromCourseWithStudents(
  idCourse: number,
  where?: Partial<Team>,
  options?: FindOptions
): Promise<TeamDetailDtoGlobal[]> {
  const teams = await TeamModel.findAll({
    include: [
      {
        model: TaskAttemptModel,
        include: [
          {
            model: StudentModel,
            attributes: ["id_student", "username", "first_name", "last_name"],
            as: "student",
            required: false,
            where: { deleted: false }
          },
          {
            model: TaskModel,
            attributes: ["task_order"],
            as: "task",
            required: false
          }
        ],
        where: {
          active: where?.active ?? sequelize.col("TeamModel.active")
        },
        attributes: ["power"],
        as: "taskAttempts",
        required: false
      },
      {
        model: CourseModel,
        attributes: [],
        as: "course",
        where: { deleted: false }
      }
    ],
    where: { id_course: idCourse, ...where },
    ...options
  });

  return teams.map(
    ({ id_team, name, active, playing, code, taskAttempts }) => ({
      id: id_team,
      name,
      active,
      playing,
      code: code || "",
      taskOrder: taskAttempts[0]?.task.task_order || null,
      students: taskAttempts.map(
        ({
          student: { username, first_name, last_name, id_student },
          power
        }) => ({
          id: id_student,
          username,
          firstName: first_name,
          lastName: last_name,
          power: power || null
        })
      )
    })
  );
}

export function filterTeamsForStudents(
  teams: TeamDetailDtoGlobal[]
): TeamDetailDtoStudent[] {
  return teams
    .filter(({ active, playing }) => active && !playing)
    .map(({ id, code, name, students, taskOrder }) => ({
      id,
      code,
      name,
      taskOrder,
      students
    }));
}

export async function notifyCourseOfTeamUpdate(
  idCourse: number,
  idTeam?: number,
  idStudent?: number
): Promise<void> {
  let courseRoom, studentSocket;
  if (idStudent) {
    studentSocket = directoryStudents.get(idStudent);
  }
  if (studentSocket) {
    courseRoom = studentSocket.broadcast.to(`c${idCourse}`);
  } else {
    const channelStudents = of(Namespaces.STUDENTS);
    if (!channelStudents) return;
    courseRoom = channelStudents.to(`c${idCourse}`);
  }

  if (idTeam) {
    courseRoom = courseRoom.except(`t${idTeam}`);
  }

  const teams: TeamDetailDtoTeacher[] = await getTeamsFromCourseWithStudents(
    idCourse
  );

  const dataStudents: TeamDetailDtoStudent[] = filterTeamsForStudents(teams);
  courseRoom.emit(OutgoingEvents.TEAMS_UPDATE, dataStudents);

  const dataTeachers: TeamDetailDtoTeacher[] = teams.filter(
    ({ active }) => active
  );

  of(Namespaces.TEACHERS)
    ?.to(`c${idCourse}`)
    .emit(OutgoingEvents.TEAMS_UPDATE, dataTeachers);
}

export async function createSession(idTeacher: number, idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await repositoryService.findOne<CourseModel>(
    CourseModel,
    {
      where: { id_teacher: idTeacher, id_course: idCourse, deleted: false }
    }
  );
  if (session) {
    throw new ApiError("Course already has an active session", 400);
  }

  await initializeTeams(idCourse);
  await cleanLeaderBoard(idCourse);
  try {
    await finishCourseTaskAttempts(idCourse);
  } catch (e) {}
  await repositoryService.update<CourseModel>(
    CourseModel,
    { session: true },
    { where: { id_course: idCourse } }
  );
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_CREATE);
}

export async function startSession(idTeacher: number, idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await repositoryService.findOne<CourseModel>(
    CourseModel,
    {
      where: { id_teacher: idTeacher, id_course: idCourse, deleted: false }
    }
  );
  if (!session) {
    throw new ApiError("Course has no active session", 400);
  }

  await startPlayingTeams(idCourse);
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_START);
  new Promise(async () => {
    try {
      await updateLeaderBoard(idCourse);
    } catch (e) {}
    try {
      await emitLeaderboard(idCourse);
    } catch (e) {}
  }).catch(console.log);
}

export async function endSession(idTeacher: number, idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await repositoryService.findOne<CourseModel>(
    CourseModel,
    {
      where: { id_teacher: idTeacher, id_course: idCourse, deleted: false }
    }
  );
  if (!session) {
    throw new ApiError("Course has no active session", 400);
  }

  await repositoryService.update<CourseModel>(
    CourseModel,
    { session: false },
    { where: { id_course: idCourse } }
  );
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_END);
  Promise.allSettled([
    repositoryService.update<TeamModel>(
      TeamModel,
      { playing: false, active: false },
      { where: { id_course: idCourse } }
    ),
    finishCourseTaskAttempts(idCourse),
    cleanLeaderBoard(idCourse)
  ]).catch(console.log);
}

export async function initializeTeams(idCourse: number) {
  // Clean used teams
  await cleanTeams(idCourse);
  await createMissingTeams(idCourse);
}

export async function createMissingTeams(
  idCourse: number,
  socketBased: boolean = false
) {
  // Get all teams
  const teamsPromise = getActiveTeamsFromCourse(idCourse).then((teams) => {
    // return the number of teams and the names of the active teams
    return {
      activeTeams: (socketBased
        ? teams.filter((team) => !team.playing)
        : teams
      ).map((team) => team.name)
    };
  });

  // Get students
  let studentsPromise;
  if (!socketBased) {
    studentsPromise = repositoryService
      .findAll<StudentModel>(StudentModel, {
        where: { id_course: idCourse, deleted: false },
        include: [
          {
            model: BlindnessAcuityModel,
            attributes: ["level"],
            as: "blindnessAcuity"
          },
          {
            model: CourseModel,
            as: "course",
            where: { deleted: false },
            attributes: []
          }
        ]
      })
      .then((students) => {
        // return the number of students and the number of students with blindness
        return {
          students: students.length,
          blindStudents: students.filter(
            (student) => student.blindnessAcuity.level > 0
          ).length
        };
      });
  } else {
    studentsPromise = StudentModel.findAll({
      where: {
        id_course: idCourse,
        id_student: {
          [Op.in]: Array.from(directoryStudents.keys())
        }
      },
      include: [
        {
          model: TaskAttemptModel,
          as: "taskAttempts",
          attributes: [],
          required: false,
          where: { active: true },
          include: [
            {
              model: TeamModel,
              as: "team",
              attributes: [],
              required: false,
              where: { playing: false }
            }
          ]
        }
      ]
    }).then((students) => {
      return {
        students: students.length,
        blindStudents: students.filter(
          (student) => student.blindnessAcuity.level > 0
        ).length
      };
    });
  }
  // Get the results
  const [teams, students] = await Promise.all([teamsPromise, studentsPromise]);

  // Get the spected number of teams
  let nTeams = Math.ceil(students.students / 3);
  const blindConsidered: boolean = true;

  if (blindConsidered) {
    // The number of teams is at least the number of blind students
    nTeams = Math.max(nTeams, students.blindStudents);
    // the number of teams is at most the number of students divided by 2
    nTeams = Math.min(nTeams, Math.ceil(students.students / 2));
  }

  // If there are more teams than active teams, we need to create new teams
  if (nTeams > teams.activeTeams.length) {
    // Get the number of teams to create
    const nTeamsToCreate = nTeams - teams.activeTeams.length;
    // Create the teams
    await createBunchOfTeams(idCourse, nTeamsToCreate, teams.activeTeams);
  }
}

export async function createBunchOfTeams(
  idCourse: number,
  numberTeams: number,
  usedTeamNames?: string[]
) {
  if (usedTeamNames === undefined) {
    usedTeamNames =
      (await getActiveTeamsFromCourse(idCourse).then((teams) =>
        teams.map((team) => team.name)
      )) || [];
  }

  const teams = [];
  for (let i = 0; i < numberTeams; i++) {
    let name = await generateTeamName(usedTeamNames);
    usedTeamNames.push(name);
    teams.push(name);
  }

  await createTeams(teams, idCourse);
  notifyCourseOfTeamUpdate(idCourse).catch(console.log);
}
