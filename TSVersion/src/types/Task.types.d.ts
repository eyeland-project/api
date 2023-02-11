import { Model } from "sequelize";

// imports
export interface Task {
    id_task: number;
    name: string;
    description: string;
    task_order: number;
    thumbnail_url?: string;
    msg_pretask?: string;
    msg_duringtask?: string;
    msg_postask?: string;
    deleted: boolean;
};

export type TaskCreation = Omit<Task, 'id_task'>;
