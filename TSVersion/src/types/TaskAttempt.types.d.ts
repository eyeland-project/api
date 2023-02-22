import { Model, ForeignKey } from "sequelize";

export interface TaskAttempt {
    id_task_attempt: number;
    id_task: ForeignKey<number>;
    id_team?: ForeignKey<number> | null;
    id_student: ForeignKey<number>;
    power?: Power | null;
    active: boolean;
    time_stamp: Date;
};

export type Power = 'super_hearing' | 'memory_pro' | 'super_radar';

export type TaskAttemptCreation = Omit<TaskAttempt, 'id_task_attempt' | 'time_stamp' | 'active'>;
