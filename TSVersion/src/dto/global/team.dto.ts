import { Power } from "@interfaces/enums/taskAttempt.enum";

export interface TeamDetailDto {
  id: number;
  code: string;
  name: string;
  students: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    power: Power | null;
  }[];
  active: boolean;
  taskOrder: number | null;
  playing: boolean;
}
