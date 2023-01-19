import { Model } from "sequelize";

export interface Task{
    id_task: number;
    nombre: string;
    descripcion: string;
    orden: number;
    mensajepretask: string | undefined | null;
    mensajeintask: string | undefined | null;
    mensajepostask: string | undefined | null;
}


export type TaskCreation = Omit<PartialBy<Task, "mensajepretask" | "mensajeintask" | "mensajepostask">, "id_task">;

export type TaskModel = Model<Task, TaskCreation>;