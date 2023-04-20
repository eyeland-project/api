export interface TaskSummaryDto {
  id: number;
  name: string;
  description: string;
  taskOrder: number;
  thumbnailUrl: string;
}

interface TaskStage {
  id: number;
  description: string;
  keywords: string[];
  taskStageOrder: number;
}

export interface TaskDetailDto extends TaskSummaryDto {
  longDescription: string;
  keywords: string[];
  pretask: TaskStage;
  duringtask: TaskStage;
  postask: TaskStage;
}
