import { TaskStageMechanics } from "@interfaces/enums/taskStage.enum";

export interface TaskStageDetailDto {
  description: string;
  keywords: string[];
  numQuestions: number;
  mechanics: TaskStageMechanics[];
}
