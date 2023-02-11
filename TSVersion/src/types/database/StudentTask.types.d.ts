import { ForeignKey, Model } from "sequelize";

export interface StudentTask {
    id_student_task: number;
    id_student: ForeignKey<number>;
    id_task: ForeignKey<number>;
    completed: boolean;
};

export type StudentTaskCreation = Omit<StudentTask, 'id_student_task'>;
