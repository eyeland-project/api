import { Model, ForeignKey } from "sequelize";

export interface Teacher {
    id_teacher: number;
    id_institution: ForeignKey<number>;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
};

export type TeacherCreation = Omit<Teacher, 'id_teacher'>;
