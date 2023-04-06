import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { QuestionModel, TaskModel, TaskStageModel } from "../models";
import { TaskStage } from "../types/TaskStage.types";
import { ApiError } from "../middlewares/handleErrors";
import { Question } from "../types/Question.types";
import { QuestionTopic, QuestionType } from "../types/enums";
import { groupBy } from "../utils";
import { PretaskQuestionResp } from "../types/responses/students.types";

export async function getTaskStageByOrder(
  taskOrder: number,
  taskStageOrder: number
): Promise<TaskStage> {
  const taskStages = (await sequelize.query(
    `
        SELECT ts.* FROM task_stage ts
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder}
        LIMIT 1;
    `,
    { type: QueryTypes.SELECT }
  )) as TaskStage[];
  if (!taskStages.length) throw new ApiError("TaskStage not found", 404);
  return taskStages[0];
}

export async function getLastQuestionFromTaskStage(
  taskOrder: number,
  taskStageOrder: number
): Promise<Question> {
  const questions = (await sequelize.query(
    `
        SELECT q.* FROM question q
        JOIN task_stage ts ON q.id_task_stage = ts.id_task_stage
        JOIN task t ON ts.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder}
        ORDER BY q.question_order DESC
        LIMIT 1;
    `,
    { type: QueryTypes.SELECT }
  )) as Question[];
  if (!questions.length) throw new ApiError("Question not found", 404);
  return questions[0];
}

export async function getQuestionsFromTaskStage(
  taskOrder: number,
  taskStageOrder: number
): Promise<PretaskQuestionResp[]> {
  interface OptionWithQuestion {
    id_option: number;
    content_option: string;
    correct: boolean;
    feedback: string;
    id_question: number;
    content_question: string;
    img_alt: string;
    img_url: string;
    type: QuestionType;
    topic: QuestionTopic | null;
  }
  const optionsWithQuestion = await sequelize.query<OptionWithQuestion>(
    `
        SELECT o.id_option AS id_option, o.content AS content_option, o.correct, o.feedback, q.id_question, q.content AS content_question, q.img_alt AS img_alt, q.img_url AS img_url, q.type, q.topic
        FROM question q
        JOIN task_stage ts ON q.id_task_stage = ts.id_task_stage
        JOIN task t ON ts.id_task = t.id_task
        LEFT JOIN option o ON q.id_question = o.id_question
        WHERE t.task_order = ${taskOrder} AND ts.task_stage_order = ${taskStageOrder}
        ORDER BY RANDOM()
        LIMIT 10;
    `,
    { type: QueryTypes.SELECT }
  );

  const questions = groupBy(optionsWithQuestion, "id_question");
  return questions.map((options) => {
    const { content_question, id_question, img_alt, img_url, topic, type } =
      options[0];
    return {
      id: id_question,
      content: content_question,
      imgAlt: img_alt,
      imgUrl: img_url,
      topic,
      type,
      options: options
        .filter(({ id_option }) => {
          return id_option !== null;
        })
        .map(({ content_option, correct, feedback, id_option }) => ({
          id: id_option,
          content: content_option,
          feedback,
          correct
        }))
    };
  });
}
