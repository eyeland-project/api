import { Model, ForeignKey } from "sequelize";

export interface Student {
    id_student: number;
    id_course: ForeignKey<number>;
    current_team?: ForeignKey<number>;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    blindness: 'total' | 'partial' | 'none';
    password: string;
    comparePassword: (password: string) => boolean;
};

export type StudentCreation = Omit<Student, 'id_student'>;
