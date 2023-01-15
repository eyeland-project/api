export interface Estudiante {
    id_estudiante: number;
    nombre: string;
    apellido: string;
    email: string;
    username: string;
    password: string;
    grupoactual: number | undefined | null;
    id_curso: number;
}