import { InferAttributes, InferCreationAttributes, Model } from "sequelize";

// imports
export interface Admin {
    id_admin: number;
    nombre: string;
    apellido: string;
    email: string;
    username: string;
    password: string;
};

export type AdminCreation = Omit<Admin, 'id_admin'>;

export type AdminModel = Model<Admin, AdminCreation>;