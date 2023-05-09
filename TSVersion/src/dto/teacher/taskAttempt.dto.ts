export interface TaskAttemptSubmissionDetailDto {
  id: number;
  timeStamp: Date;
  task: {
    id: number;
    taskOrder: number;
    name: string;
  };
  student: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
}
