import { Power } from "@interfaces/enums/taskAttempt.enum";

export interface TeamResp {
  id: number;
  code: string;
  name: string;
  taskOrder: number | null;
  students: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    power: Power | null;
  }[];
}

export interface UserResp {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  visualCondition?: string;
}
