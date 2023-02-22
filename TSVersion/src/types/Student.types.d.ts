import { Model, ForeignKey } from "sequelize";
import { Power } from "./TaskAttempt.types";

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

export interface TeamMember extends Student {
    task_attempt: {
        id: number;
        power: Power | null;
    };
    blindness_acuity: {
        name: string;
        level: number;
    }
}

export type StudentCreation = Omit<Student, 'id_student'>;
