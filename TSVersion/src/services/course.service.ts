import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import {
  CourseModel,
  StudentModel,
  TaskAttemptModel,
  TaskModel,
  TeamModel
} from "../models";
import { Course } from "../types/Course.types";
import { Team } from "../types/Team.types";
import { Namespaces, of } from "../listeners/sockets";
import { OutgoingEvents, Power } from "../types/enums";
import { groupBy } from "../utils";
import { TeamResp as TeamRespTeacher } from "../types/responses/teachers.types";
import { TeamResp as TeamRespStudent } from "../types/responses/students.types";
import { Student } from "../types/Student.types";
import { directory as directoryStudents } from "../listeners/namespaces/students";
import { emitLeaderboard, updateLeaderBoard } from "./leaderBoard.service";
import { startPlayingTeams } from "./team.service";

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
  const teams = await TeamModel.findAll({
    include: [
      {
        model: TaskAttemptModel,
        include: [
          {
            model: StudentModel,
            attributes: ["id_student", "username", "first_name", "last_name"],
            as: "student"
          },
          {
            model: TaskModel,
            attributes: ["task_order"],
            as: "task"
          }
        ],
        where: {
          active: sequelize.col("TeamModel.active")
        },
        attributes: ["power"],
        as: "taskAttempts"
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
          power
        })
      )
    })
  );
}

export async function getAvailableTeamsFromCourseWithStudents(
  idCourse: number
): Promise<TeamRespStudent[]> {
  return (await getTeamsFromCourseWithStudents(idCourse))
    .filter(({ active, playing }) => active && !playing)
    .map(({ id, code, name, students, taskOrder }) => ({
      id,
      code,
      name,
      taskOrder,
      students
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

  // updateTeams(idCourse)
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

  await startPlayingTeams(idCourse);
  updateLeaderBoard(idCourse);
  nsp.to("c" + id_course).emit(OutgoingEvents.SESSION_START);
  emitLeaderboard(idCourse);
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
