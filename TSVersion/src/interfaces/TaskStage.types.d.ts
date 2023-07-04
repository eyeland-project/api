import { ForeignKey, Model } from "sequelize";
import { TaskStageMechanics } from "./enums/taskStage.enum";

export interface TaskStage {
  id_task_stage: number;
  id_task: ForeignKey<number>;
  task_stage_order: number;
  description: string;
  keywords: string[];
  mechanics?: TaskStageMechanics[] | null;
}

export type TaskStageCreation = Omit<TaskStage, "id_task_stage" | "mechanics">;
