import { Model, ForeignKey } from "sequelize";

export interface Student {
    id_student: number;
    id_course: ForeignKey<number>;
    id_blindness_acuity: ForeignKey<number>;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    comparePassword: (password: string) => boolean;
};

export type StudentCreation = Omit<Student, 'id_student'>;
