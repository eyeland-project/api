export interface StudentSummaryDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string | null;
  phone: {
    countryCode: string | null;
    number: string;
  } | null;
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
  // idCourse: number; // since the route is /courses/:idCourse/students, this is not needed
  blindnessAcuityCode: string;
  visualFieldDefectCode: string;
  colorDeficiencyCode: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email?: string;
  phoneCode?: string;
  phoneNumber?: string;
}

export type StudentUpdateDto = Partial<StudentCreateDto>;
