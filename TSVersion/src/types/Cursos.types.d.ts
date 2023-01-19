import { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import PartialBy from "./PartialBy";

export interface Curso {
    id_curso: number;
    nombre: string;
    descripcion: string | null;
    status: boolean;
    id_profesor: number;
    id_institucion: number;
};

export type CursoCreation = PartialBy<Omit<Curso, 'id_curso'>, 'descripcion'>;

export type CursoModel = Model<Curso, CursoCreation>;