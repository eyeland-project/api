export interface Task {
    id_task: number;
    nombre: string;
    descripcion: string;
    orden: number;
    mensajepretask: string | undefined | null;
    mensajeintask: string | undefined | null;
    mensajepostask: string | undefined | null;
}