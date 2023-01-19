import { CreationOptional } from "sequelize";
import PartialBy from "./PartialBy";

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

export type EstudianteCreation = PartialBy<Omit<Estudiante, 'id_estudiante'>, "grupoactual">;

export type EstudianteModel = Model<Estudiante, Estudiante>;