import { Model, ForeignKey } from "sequelize";
import { Power } from "@interfaces/TaskAttempt.types";

export interface Student {
  id_student: number;
  id_course: ForeignKey<number>;
  id_blindness_acuity: ForeignKey<number>;
  id_visual_field_defect: ForeignKey<number>;
  id_color_deficiency: ForeignKey<number>;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email: string;
  phone_code: string;
  phone_number: string;
  comparePassword: (password: string) => boolean;
}

export type StudentCreation = Omit<Student, "id_student">;
