import { Model } from "sequelize";

export interface Profesor {
    id_profesor: number;
    nombre: string;
    apellido: string;
    email: string;
    username: string;
    password: string;
    id_institucion: number;
};

export type ProfesorCreation = Omit<Profesor, 'id_profesor'>;

export interface ProfesorModel extends Model<Profesor, ProfesorCreation>, Profesor{};