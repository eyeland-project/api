export interface StudentSummaryDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: {
    countryCode: string;
    number: string;
  };
}

interface VisualDisease {
  id: number;
  code: string;
  name: string;
}

export interface StudentDetailDto extends StudentSummaryDto {
  blindnessAcuity: VisualDisease;
  visualFieldDefect: VisualDisease;
  colorDeficiency: VisualDisease;
}

export interface StudentCreateDto {
  idCourse: number;
  idBlindnessAcuity: number;
  idVisualFieldDefect: number;
  idColorDeficiency: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
}

export type StudentUpdateDto = Partial<StudentCreateDto>;
