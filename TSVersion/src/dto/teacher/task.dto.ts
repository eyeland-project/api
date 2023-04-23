export interface TaskSummaryDto {
  id: number;
  name: string;
  taskOrder: number;
}

export interface TaskDetailDto extends TaskSummaryDto {
  description: string;
  thumbnailUrl: string;
  longDescription: string;
  keywords: string[];
}
