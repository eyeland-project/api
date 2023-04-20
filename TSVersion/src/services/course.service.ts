import { Op } from "sequelize";
import sequelize from "@database/db";
import { ApiError } from "@middlewares/handleErrors";
import {
  BlindnessAcuityModel,
  CourseModel,
  StudentModel,
  TaskAttemptModel,
  TaskModel,
  TeamModel
} from "@models";
import { Course } from "@interfaces/Course.types";
import { Namespaces, of } from "@listeners/sockets";
import { OutgoingEvents } from "@interfaces/enums/socket.enum";
import { generateTeamName } from "@utils";
import { TeamDetailDto as TeamDetailDtoGlobal } from "@dto/global/team.dto";
import { TeamDetailDto as TeamDetailDtoTeacher } from "@dto/teacher/team.dto";
import { TeamDetailDto as TeamDetailDtoStudent } from "@dto/student/team.dto";
import { directory as directoryStudents } from "@listeners/namespaces/student";
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
import { getCourseFromTeacher, getTeacherById } from "./teacher.service";
import { CourseUpdateDto } from "@dto/teacher/course.dto";

// COURSE CRUD
// get many
export async function getCourses(): Promise<Course[]> {
  return await CourseModel.findAll();
}

// get one
export async function getCourseById(idCourse: number): Promise<Course> {
  const course = await CourseModel.findOne({ where: { id_course: idCourse } });
  if (!course) throw new ApiError("Course not found", 404);
  return course;
}

export async function createCourse(
  idTeacher: number,
  name: string
): Promise<Course> {
  const { id_institution } = await getTeacherById(idTeacher);
  return await CourseModel.create({
    name,
    id_institution,
    id_teacher: idTeacher
  });
}

export async function updateCourse(idCourse: number, fields: CourseUpdateDto) {
  const result = await CourseModel.update(fields, {
    where: { id_course: idCourse }
  });
  if (!result[0]) throw new ApiError("Course not found", 404);
}

export async function deleteCourse(idCourse: number) {
  const result = await CourseModel.destroy({ where: { id_course: idCourse } });
  if (!result) throw new ApiError("Course not found", 404);
}

export async function getTeamsFromCourseWithStudents(
  idCourse: number
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
          active: sequelize.col("TeamModel.active")
        },
        attributes: ["power"],
        as: "taskAttempts",
        required: false
      },
      {
        model: CourseModel,
        as: "course",
        where: { deleted: false }
      }
    ],
    where: { id_course: idCourse }
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

export function getStudentsFromCourse(
  idCourse: number
): Promise<StudentModel[]> {
  return StudentModel.findAll({
    where: { id_course: idCourse, deleted: false },
    include: [
      {
        model: BlindnessAcuityModel
      },
      {
        model: CourseModel,
        as: "course",
        where: { deleted: false }
      }
    ]
  });
}

export async function notifyCourseOfTeamUpdate(
  idCourse: number,
  idTeam?: number,
  idStudent?: number
): Promise<void> {
  let courseRoom;
  if (idStudent) {
    const studentSocket = directoryStudents.get(idStudent);
    if (!studentSocket) return;
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
  const dataTeachers: TeamDetailDtoTeacher[] = teams.filter(
    ({ active }) => active
  );

  courseRoom.emit(OutgoingEvents.TEAMS_UPDATE, dataStudents);
  of(Namespaces.TEACHERS)?.emit(OutgoingEvents.TEAMS_UPDATE, dataTeachers);
}

export async function createSession(idTeacher: number, idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await getCourseFromTeacher(
    idTeacher,
    idCourse
  );
  if (session) {
    throw new ApiError("Course already has an active session", 400);
  }

  await initializeTeams(idCourse);
  await cleanLeaderBoard(idCourse);
  await updateCourse(idCourse, { session: true });
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_CREATE);
}

export async function startSession(idTeacher: number, idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await getCourseFromTeacher(
    idTeacher,
    idCourse
  );
  if (!session) {
    throw new ApiError("Course has no active session", 400);
  }

  await startPlayingTeams(idCourse);
  updateLeaderBoard(idCourse);
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_START);
  emitLeaderboard(idCourse);
}

export async function endSession(idTeacher: number, idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await getCourseFromTeacher(
    idTeacher,
    idCourse
  );
  if (!session) {
    throw new ApiError("Course has no active session", 400);
  }

  await updateCourse(idCourse, { session: false });
  await cleanLeaderBoard(idCourse);
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_END);
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
    studentsPromise = getStudentsFromCourse(idCourse).then((students) => {
      // return the number of students and the number of students with blindness
      return {
        students: students.length,
        blindStudents: students.filter(
          (student) => student.blindnessAcuityModel.level > 0
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
          where: {
            active: true
          },
          required: false,
          include: [
            {
              model: TeamModel,
              as: "team",
              where: {
                playing: false
              },
              required: false
            }
          ]
        }
      ]
    }).then((students) => {
      return {
        students: students.length,
        blindStudents: students.filter(
          (student) => student.blindnessAcuityModel.level > 0
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
}
