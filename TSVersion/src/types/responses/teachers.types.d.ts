import { Power } from "../enums";

// general
export interface ElementCreatedResp {
  id: number;
}

// auth
export interface LoginResp {
  token: string;
}

// tasks
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

// courses
export interface CourseSummResp {
  id: number;
  name: string;
}

export interface CourseResp {
  id: number;
  name: string;
  session: boolean;
}

// students
export interface StudentSummResp {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
}

export interface StudentResp {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  blindness: {
    acuity: {
      id: number;
      name: string;
    };
  };
}

// teams
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
