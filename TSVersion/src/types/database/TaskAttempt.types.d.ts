import { Model, ForeignKey } from "sequelize";

export interface TaskAttempt {
    id_task_attempt: number;
    id_task: ForeignKey<number>;
    id_team?: ForeignKey<number>;
    id_student: ForeignKey<number>;
    power?: string;
    active: boolean;
    start_time?: Date;
    end_time?: Date;
};

export type TaskAttemptCreation = Omit<TaskAttempt, 'id_task_attempt' | 'active'>;
