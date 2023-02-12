import { ForeignKey, Model } from "sequelize";

export interface TaskStage {
    id_task_stage: number;
    id_task: ForeignKey<number>;
    task_stage_order: number;
    description: string;
    keywords: string[];
};

export type TaskStageCreation = Omit<TaskStage, 'id_task_stage'>;
