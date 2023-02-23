import { ForeignKey, Model } from "sequelize";

export interface StudentTask {
    id_student_task: number;
    id_student: ForeignKey<number>;
    id_task: ForeignKey<number>;
    highest_stage: number;
};

export type StudentTaskCreation = Omit<StudentTask, 'id_student_task'>;
