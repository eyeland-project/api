import { StudentModel } from "../types/Student.types";

export function hasTeam(student: StudentModel): boolean {
  return student.current_team !== null;
}
