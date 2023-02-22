import { Model } from "sequelize";

export interface Task {
    id_task: number;
    task_order: number;
    name: string;
    description: string;
    long_description?: string | null;
    keywords: string[];
    thumbnail_url?: string | null;
    deleted: boolean;
};

export type TaskCreation = Omit<Task, 'id_task'>;
