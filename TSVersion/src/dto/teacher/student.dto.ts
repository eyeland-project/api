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
