import { Model } from "sequelize";

export interface StudentTask {
    id_student_task: number;
    id_student: number;
    id_task: number;
    completed: boolean;
};

export type StudentTaskCreation = Omit<StudentTask, 'id_student_task'>;
