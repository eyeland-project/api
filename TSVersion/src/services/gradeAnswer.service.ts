import { AnswerModel, CourseModel, GradeAnswerModel, StudentModel, TaskAttemptModel, TeacherModel } from "@models";
import {
  GradeAnswerCreateDto,
  GradeAnswerUpdateDto
} from "@dto/teacher/gradeAnswer.dto";
import * as repositoryService from "@services/repository.service";

export async function createGradeAnswer(
  idTeacher: number,
  idCourse: number,
  idTaskAttempt: number,
  idAnswer: number,
  fields: GradeAnswerCreateDto
): Promise<{ id: number }> {
  // check if answer exists
  await repositoryService.findOne<AnswerModel>(AnswerModel, {
    where: { id_answer: idAnswer, id_task_attempt: idTaskAttempt },
    include: [
      {
        model: TaskAttemptModel,
        as: "taskAttempt",
        include: [
          {
            model: StudentModel,
            as: "student",
            where: { id_course: idCourse, deleted: false },
            include: [
              {
                model: CourseModel,
                as: "course",
                where: { id_teacher: idTeacher, deleted: false }
              }
            ]
          }
        ]
      }
    ]
  });
  const { grade, comment } = fields;
  const { id_grade_answer } = await repositoryService.create<GradeAnswerModel>(
    GradeAnswerModel,
    {
      grade,
      id_answer: idAnswer,
      id_teacher: idTeacher,
      comment
    }
  );
  return { id: id_grade_answer };
}

export async function updateGradeAnswer(
  idTeacher: number,
  idCourse: number,
  idTaskAttempt: number,
  idAnswer: number,
  idGradeAnswer: number,
  fields: GradeAnswerUpdateDto
) {
  // check if gradeAnswer exists
  await repositoryService.findOne<GradeAnswerModel>(GradeAnswerModel, {
    where: {
      id_grade_answer: idGradeAnswer,
      id_teacher: idTeacher,
      id_answer: idAnswer
    },
    include: [
      {
        model: AnswerModel,
        as: "answer",
        where: { id_task_attempt: idTaskAttempt },
        include: [
          {
            model: TaskAttemptModel,
            as: "taskAttempt",
            include: [
              {
                model: StudentModel,
                as: "student",
                where: { id_course: idCourse, deleted: false },
                include: [
                  {
                    model: CourseModel,
                    as: "course",
                    where: { id_teacher: idTeacher, deleted: false }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  });
  // update gradeAnswer
  await repositoryService.update<GradeAnswerModel>(GradeAnswerModel, fields, {
    where: {
      id_grade_answer: idGradeAnswer,
      id_teacher: idTeacher,
      id_answer: idAnswer
    }
  });
}

export async function deleteGradeAnswer(
  idTeacher: number,
  idCourse: number,
  idTaskAttempt: number,
  idAnswer: number,
  idGradeAnswer: number
) {
  // check if gradeAnswer exists
  await repositoryService.findOne<GradeAnswerModel>(GradeAnswerModel, {
    where: {
      id_grade_answer: idGradeAnswer,
      id_teacher: idTeacher,
      id_answer: idAnswer
    },
    include: [
      {
        model: AnswerModel,
        as: "answer",
        where: { id_task_attempt: idTaskAttempt },
        include: [
          {
            model: TaskAttemptModel,
            as: "taskAttempt",
            include: [
              {
                model: StudentModel,
                as: "student",
                where: { id_course: idCourse, deleted: false },
                include: [
                  {
                    model: CourseModel,
                    as: "course",
                    where: { id_teacher: idTeacher, deleted: false }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  });
  // delete gradeAnswer
  await repositoryService.destroy<GradeAnswerModel>(GradeAnswerModel, {
    where: {
      id_grade_answer: idGradeAnswer,
      id_teacher: idTeacher,
      id_answer: idAnswer
    }
  });
}
