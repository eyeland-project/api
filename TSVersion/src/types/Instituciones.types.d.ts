import { Model } from "sequelize";

export interface Institucion {
    id_institucion: number;
    nombre: string;
    nit: string;
    direccion: string;
    ciudad: string;
    pais: string;
    telefono: string;
    email: string;
}

export type InstitucionCreation = Omit<Institucion, "id_institucion">;

export interface InstitucionModel extends Model<Institucion, InstitucionCreation>, Institucion{};