export interface CourseSummResp {
  id: number;
  name: string;
}

export interface CourseResp {
  id: number;
  name: string;
  session: boolean;
}

export interface CourseCreateReq {
  name: string;
  description: string;
}

export interface CourseUpdateReq {
  name: string;
  description: string;
}
