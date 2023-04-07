import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import {
  OptionModel,
  QuestionModel,
  TaskModel,
  TaskStageModel
} from "../models";
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
  stageOrder: number
): Promise<PretaskQuestionResp[]> {
  const questions = await QuestionModel.findAll({
    include: [
      {
        model: TaskStageModel,
        as: "stage",
        include: [
          {
            model: TaskModel,
            where: {
              task_order: taskOrder
            }
          }
        ],
        where: {
          task_stage_order: stageOrder
        }
      },
      {
        model: OptionModel,
        required: true,
        as: "options"
      }
    ],
    limit: 10,
    order: sequelize.random()
  });

  return questions.map(
    ({ content, id_question, img_alt, img_url, topic, type, options }) => ({
      id: id_question,
      content,
      imgAlt: img_alt!,
      imgUrl: img_url!,
      topic,
      type,
      options: options.map((option) => {
        const { content, correct, feedback, id_option } = option;
        return {
          id: id_option,
          content,
          feedback: feedback!,
          correct
        };
      })
    })
  );
}
