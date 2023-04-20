import { Power } from "@interfaces/enums/taskAttempt.enum";

export interface TeamResp {
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

export interface TeamCreateReq {
  name: string;
}

export interface TeamUpdateReq {
  name: string;
  active: false;
}
