export interface TaskStageDetailDto {
  id: number;
  taskStageOrder: number;
  keywords: string[];
  description: string;
  numQuestions: number;
}

export interface TaskStagesDetailDto {
  pretask: TaskStageDetailDto;
  duringtask: TaskStageDetailDto;
  postask: TaskStageDetailDto;
}
