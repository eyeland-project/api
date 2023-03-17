// teams
export interface TeamResp {
  id: number;
  code: string;
  name: string;
  active: boolean;
  taskOrder: number | null;
  students: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    power: Power | null;
  }[];
}
