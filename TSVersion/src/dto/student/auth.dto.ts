export interface LoginResp {
  token: string;
}

export interface LoginTeamReq {
  code: string;
  taskOrder: number;
}
