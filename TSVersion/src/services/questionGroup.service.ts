import { ApiError } from "@middlewares/handleErrors";
import {
  QuestionGroupModel,
  QuestionModel,
  TaskStageModel,
  TeamModel,
  TeamNameModel
} from "@models";
import * as repositoryService from "@services/repository.service";

export async function getQuestionGroupFromTeam({
  idTeam,
  idTaskStage,
  taskStageOrder,
  idTask
}: {
  idTeam: number;
  idTaskStage?: number;
  taskStageOrder?: number;
  idTask?: number;
}): Promise<QuestionGroupModel> {
  if (
    idTaskStage === undefined &&
    (taskStageOrder === undefined || idTask === undefined)
  ) {
    throw new ApiError("Missing idTaskStage or taskOrder", 400);
  }

  if (!idTaskStage) {
    idTaskStage = (
      await repositoryService.findOne<TaskStageModel>(TaskStageModel, {
        where: { task_stage_order: 2, id_task: idTask }
      })
    ).id_task_stage;
  }

  return await repositoryService.findOne<QuestionGroupModel>(
    QuestionGroupModel,
    {
      include: [
        {
          model: TeamNameModel,
          as: "teamName",
          required: true,
          //   attributes: [],
          include: [
            {
              model: TeamModel,
              as: "teams",
              required: true,
              //   attributes: [],
              where: { id_team: idTeam }
            }
          ]
        },
        {
          model: QuestionModel,
          as: "questions",
          required: true,
          attributes: [],
          where: { id_task_stage: idTaskStage }
        }
      ]
    }
  );
}
