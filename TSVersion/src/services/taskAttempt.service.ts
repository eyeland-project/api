import { FindOptions, QueryTypes, Transaction } from "sequelize";
import { ApiError } from "@middlewares/handleErrors";
import {
  AnswerModel,
  CourseModel,
  QuestionModel,
  StudentModel,
  TaskAttemptModel,
  TaskModel,
  TaskStageModel
} from "@models";
import { TaskAttempt } from "@interfaces/TaskAttempt.types";
import sequelize from "@database/db";
import { TaskAttemptSubmissionDetailDto } from "@dto/teacher/taskAttempt.dto";
import * as repositoryService from "@services/repository.service";

export async function getTaskAttemptSubmissionsFromCourse(
  idTeacher: number,
  idCourse: number
): Promise<TaskAttemptSubmissionDetailDto[]> {
  return mapTaskAttemptsToSubmissions(
    await repositoryService.findAll<TaskAttemptModel>(TaskAttemptModel, {
      attributes: ["id_task_attempt", "time_stamp"],
      where: { active: false },
      order: [["time_stamp", "DESC"]],
      include: [
        {
          model: TaskModel,
          attributes: ["id_task", "task_order", "name"],
          as: "task"
        },
        {
          model: StudentModel,
          attributes: ["id_student", "first_name", "last_name", "username"],
          as: "student",
          where: { id_course: idCourse, deleted: false },
          include: [
            {
              model: CourseModel,
              attributes: [],
              as: "course",
              where: { id_teacher: idTeacher, deleted: false }
            }
          ]
        },
        {
          model: AnswerModel,
          attributes: ["id_answer"],
          as: "answers",
          required: true,
          include: [
            {
              model: QuestionModel,
              attributes: ["id_question"],
              as: "question",
              required: true,
              include: [
                {
                  model: TaskStageModel,
                  attributes: ["id_task_stage", "task_stage_order"],
                  as: "taskStage",
                  required: true,
                  where: { task_stage_order: 3 } // only get answers from postask
                }
              ]
            }
          ]
        }
      ]
    })
  );
}

export async function getTaskAttemptsFromCourseForTeacher(
  idTeacher: number,
  idCourse: number
): Promise<TaskAttemptSubmissionDetailDto[]> {
  return await getTaskAttemptsFromCourse(idTeacher, idCourse);
}

export async function getTaskAttemptFromCourseForTeacher(
  idTeacher: number,
  idCourse: number,
  idTaskAttempt: number
): Promise<TaskAttemptSubmissionDetailDto> {
  const taskAttempt = (
    await getTaskAttemptsFromCourse(
      idTeacher,
      idCourse,
      { id_task_attempt: idTaskAttempt },
      { limit: 1 }
    )
  )[0];
  if (!taskAttempt) throw new ApiError("TaskAttempt not found", 404);
  return taskAttempt;
}

export async function getCurrTaskAttempt(
  idStudent: number
): Promise<TaskAttempt> {
  const taskAttempt = await TaskAttemptModel.findOne({
    where: { id_student: idStudent, active: true }
  });
  if (!taskAttempt) throw new ApiError("TaskAttempt not found", 404);
  return taskAttempt;
}

export async function createTaskAttempt(
  idStudent: number,
  idTask: number,
  idTeam: number | null
): Promise<TaskAttemptModel> {
  return await TaskAttemptModel.create({
    id_student: idStudent,
    id_task: idTask,
    id_team: idTeam
  });
}

export async function updateCurrTaskAttempt(
  idStudent: number,
  values: Partial<TaskAttempt>
) {
  if (!Object.keys(values).length)
    throw new ApiError("No values to update TaskAttempt", 400);
  const result = await TaskAttemptModel.update(values, {
    where: { id_student: idStudent, active: true }
  });
  if (!result[0]) throw new ApiError("Task Attempt not found", 404);
}

export async function finishStudentTaskAttempts(idStudent: number) {
  await TaskAttemptModel.update(
    { active: false },
    { where: { id_student: idStudent, active: true } }
  );
}

export async function finishTaskAttemptsFromCourse(idCourse: number) {
  await sequelize
    .query(
      `
    UPDATE task_attempt
    SET active = false
    WHERE id_student IN (
      SELECT id_student
      FROM student
      WHERE id_course = ${idCourse}
    ) AND active = true;
    `,
      { type: QueryTypes.UPDATE }
    )
    .catch(console.log);
}

async function getTaskAttemptsFromCourse(
  idTeacher: number,
  idCourse: number,
  where?: Partial<TaskAttempt>,
  options?: FindOptions
): Promise<TaskAttemptSubmissionDetailDto[]> {
  return mapTaskAttemptsToSubmissions(
    await repositoryService.findAll<TaskAttemptModel>(TaskAttemptModel, {
      attributes: ["id_task_attempt", "time_stamp"],
      where: { active: false, ...where },
      order: [["time_stamp", "DESC"]],
      include: [
        {
          model: TaskModel,
          attributes: ["id_task", "task_order", "name"],
          as: "task"
        },
        {
          model: StudentModel,
          attributes: ["id_student", "first_name", "last_name", "username"],
          as: "student",
          where: { id_course: idCourse, deleted: false },
          include: [
            {
              model: CourseModel,
              attributes: [],
              as: "course",
              where: { id_teacher: idTeacher, deleted: false }
            }
          ]
        }
      ],
      ...options
    })
  );
}

async function mapTaskAttemptsToSubmissions(
  taskAttempts: TaskAttemptModel[]
): Promise<TaskAttemptSubmissionDetailDto[]> {
  return taskAttempts.map(({ id_task_attempt, time_stamp, student, task }) => ({
    id: id_task_attempt,
    student: {
      id: student.id_student,
      firstName: student.first_name,
      lastName: student.last_name,
      username: student.username
    },
    task: {
      id: task.id_task,
      name: task.name,
      taskOrder: task.task_order
    },
    timeStamp: time_stamp
  }));
}
