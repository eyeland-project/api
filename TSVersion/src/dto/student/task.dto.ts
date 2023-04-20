export interface TaskSummaryDto {
  id: number;
  name: string;
  description: string;
  taskOrder: number;
  completed: boolean;
  blocked: boolean;
  comingSoon: boolean;
  thumbnailUrl: string;
  thumbnailAlt: string;
}

export interface TaskDetailDto {
  id: number;
  name: string;
  description: string;
  taskOrder: number;
  thumbnailUrl: string;
  thumbnailAlt: string;
  keywords: string[];
  longDescription: string;
}

interface ProgressBody {
  completed: boolean;
  blocked: boolean;
}

export interface TaskProgressDetailDto {
  pretask: ProgressBody;
  duringtask: ProgressBody;
  postask: ProgressBody;
}
