import { Model, ForeignKey } from "sequelize";

export interface Teacher {
  id_teacher: number;
  id_institution: ForeignKey<number>;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  phone_code: string;
  phone_number: string;
  comparePassword: (password: string) => boolean;
}

export type TeacherCreation = Omit<Teacher, "id_teacher" | "comparePassword">;
