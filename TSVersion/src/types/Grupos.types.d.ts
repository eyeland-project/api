export interface Grupo {
    id_grupo: number;
    nombre: string;
    token: string;
    availableTasks: number;
    id_estudiante1: number;
    id_estudiante2: number | undefined | null;
    id_estudiante3: number | undefined | null;
    grupoactual: number;
}