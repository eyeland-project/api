import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import { CourseModel, StudentModel, TeamModel } from "../models";
import { Course } from "../types/Course.types";
import { Team } from "../types/Team.types";
import { Namespaces, of } from "../listeners/sockets";
import { OutgoingEvents, Power } from "../types/enums";
import { groupBy } from "../utils";
import { TeamResp as TeamRespTeacher } from "../types/responses/teachers.types";
import { TeamResp as TeamRespStudent } from "../types/responses/students.types";
import { Student } from "../types/Student.types";
import { directory as directoryStudents } from "../listeners/namespaces/students";
import { updateLeaderBoard } from "./leaderBoard.service";

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

export async function createCourse(fields: {
  name: string;
  description: string;
  id_teacher: number;
  id_institution: number;
}): Promise<Course> {
  return await CourseModel.create(fields);
}

export async function updateCourse(idCourse: number, fields: Partial<Course>) {
  const result = await CourseModel.update(fields, {
    where: { id_course: idCourse }
  });
  if (!result[0]) throw new ApiError("Course not found", 404);
}

export async function deleteCourse(idCourse: number) {
  const result = await CourseModel.destroy({ where: { id_course: idCourse } });
  if (!result) throw new ApiError("Course not found", 404);
}

export async function getTeamsFromCourse(idCourse: number): Promise<Team[]> {
  return await TeamModel.findAll({ where: { id_course: idCourse } });
}

export async function getTeamsFromCourseWithStudents(
  idCourse: number
): Promise<TeamRespTeacher[]> {
  interface StudentWithTeam {
    id_team: number;
    code: string;
    name: string;
    active: boolean;
    playing: boolean;
    id_student: number;
    username: string;
    first_name: string;
    last_name: string;
    power: Power;
    task_order: number | null;
  }

  const studentsWithTeam = await sequelize.query<StudentWithTeam>(
    `
        SELECT t.id_team, t.code, t.name, t.active, t.playing, s.id_student, s.username, s.first_name, s.last_name, ta.power, tk.task_order
        FROM team t
        LEFT JOIN task_attempt ta ON ta.id_team = t.id_team AND t.active = ta.active
        LEFT JOIN task tk ON tk.id_task = ta.id_task
        LEFT JOIN student s ON s.id_student = ta.id_student
        WHERE t.id_course = ${idCourse};
    `,
    { type: QueryTypes.SELECT }
  );

  const teams = groupBy(studentsWithTeam, "id_team") as StudentWithTeam[][];
  return teams.map((students) => {
    const { active, code, id_team, name, task_order, playing } = students[0];
    return {
      id: id_team,
      code: code,
      name: name,
      active: active,
      playing: playing,
      taskOrder: task_order,
      students: students
        .filter(({ id_student }) => {
          return id_student !== null;
        })
        .map(({ id_student, username, first_name, last_name, power }) => ({
          id: id_student,
          username,
          firstName: first_name,
          lastName: last_name,
          power
        }))
    };
  });
}

export async function getAvailableTeamsFromCourseWithStudents(
  idCourse: number
): Promise<TeamRespStudent[]> {
  return (await getTeamsFromCourseWithStudents(idCourse)).filter(
    ({ active, playing }) => active && !playing
  ).map(({ id, code, name, students }) => ({
    id,
    code,
    name,
    students,
  }));
}

export function getStudentsFromCourse(idCourse: number): Promise<Student[]> {
  return StudentModel.findAll({ where: { id_course: idCourse } });
}

export async function notifyCourseOfTeamUpdate(
  idCourse: number,
  idTeam?: number,
  idStudent?: number
): Promise<void> {
  const teams = await getAvailableTeamsFromCourseWithStudents(idCourse);

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
  courseRoom.emit(OutgoingEvents.TEAMS_UPDATE, teams);
  // TODO: notify teacher
}

export async function createSession(idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await getCourseById(idCourse);
  if (session) {
    throw new ApiError("Course already has an active session", 400);
  }

  await updateCourse(idCourse, { session: true });
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_CREATE);
}

export async function startSession(idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await getCourseById(idCourse);
  if (!session) {
    throw new ApiError("Course has no active session", 400);
  }

  updateLeaderBoard(idCourse);
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_START);
}

export async function endSession(idCourse: number) {
  const nsp = of(Namespaces.STUDENTS);
  if (!nsp) throw new ApiError("Namespace not found", 500);

  const { session, id_course } = await getCourseById(idCourse);
  if (!session) {
    throw new ApiError("Course has no active session", 400);
  }

  await updateCourse(idCourse, { session: false });
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_END);
}
