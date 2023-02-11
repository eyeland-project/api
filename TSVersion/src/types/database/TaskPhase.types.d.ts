import { ForeignKey, Model } from "sequelize";

export interface TaskPhase {
    id_task_phase: number;
    id_task: ForeignKey<number>;
    task_phase_order: number;
    name: string;
    description: string;
    long_description?: string;
    keywords: string[];
    thumbnail_url?: string;
};

export type TaskPhaseCreation = Omit<TaskPhase, 'id_task_phase'>;
