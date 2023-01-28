import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import PartialBy from "./PartialBy";

export interface Grupo{
    id_grupo: number;
    nombre: string;
    token: string;
    availableTasks: number;
    id_estudiante1: number | undefined | null;
    id_estudiante2: number | undefined | null;
    id_estudiante3: number | undefined | null;
}

export type GrupoCreation = Omit<PartialBy<Grupo, "id_estudiante1" | "id_estudiante2" | "id_estudiante3">, "id_grupo">;

export interface GrupoModel extends Model<Grupo, GrupoCreation>, Grupo{};