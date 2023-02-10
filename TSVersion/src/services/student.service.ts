import StudentModel from "../models/Student";

export function hasTeam(student: StudentModel): boolean {
  return student.current_team !== null;
}
