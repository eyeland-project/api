import { Model } from "sequelize";

// imports
export interface Task {
    id_task: number;
    task_order: number;
    name: string;
    description: string;
    long_description?: string;
    keywords: string[];
    pretask_msg?: string;
    duringtask_msg?: string;
    postask_msg?: string;
    thumbnail_url?: string;
    deleted: boolean;
};

export type TaskCreation = Omit<Task, 'id_task'>;
