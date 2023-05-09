import { GradeAnswerModel, TeacherModel } from "@models";
import {
  GradeAnswerCreateDto,
  GradeAnswerUpdateDto
} from "@dto/teacher/gradeAnswer.dto";
import * as repositoryService from "@services/repository.service";

export async function createGradeAnswer(
  idTeacher: number,
  fields: GradeAnswerCreateDto
): Promise<{ id: number }> {
  const { grade, idAnswer, comment } = fields;
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
  idGradeAnswer: number,
  fields: GradeAnswerUpdateDto
) {
  // check if gradeAnswer exists and belongs to teacher
  await repositoryService.findOne<GradeAnswerModel>(GradeAnswerModel, {
    where: { id_grade_answer: idGradeAnswer, id_teacher: idTeacher }
  });
  // update gradeAnswer
  await repositoryService.update<GradeAnswerModel>(GradeAnswerModel, fields, {
    where: { id_grade_answer: idGradeAnswer }
  });
}

export async function deleteGradeAnswer(
  idTeacher: number,
  idGradeAnswer: number
) {
  // check if gradeAnswer exists and belongs to teacher
  await repositoryService.findOne<GradeAnswerModel>(GradeAnswerModel, {
    where: { id_grade_answer: idGradeAnswer, id_teacher: idTeacher }
  });
  // delete gradeAnswer
  await repositoryService.update<GradeAnswerModel>(
    GradeAnswerModel,
    {},
    { where: { id_grade_answer: idGradeAnswer } }
  );
}
