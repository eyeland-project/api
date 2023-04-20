export interface TaskSummResp {
  id: number;
  name: string;
  description: string;
  taskOrder: number;
  thumbnailUrl: string;
}

export interface TaskResp {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  keywords: string[];
  taskOrder: number;
  thumbnailUrl: string;
}
