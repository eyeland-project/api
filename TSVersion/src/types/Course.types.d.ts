import { Model, ForeignKey } from "sequelize";

export interface Course {
    id_course: number;
    id_teacher: ForeignKey<number>;
    id_institution: ForeignKey<number>;
    name: string;
    description?: string;
    status: boolean;
};

export type CourseCreation = Omit<Course, 'id_course'>;
