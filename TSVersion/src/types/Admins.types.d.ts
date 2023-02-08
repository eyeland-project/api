import { Model } from "sequelize";

export interface Admin {
    id_admin: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
};

export type AdminCreation = Omit<Admin, 'id_admin'>;

export interface AdminModel extends Model<Admin, AdminCreation>, Admin { };
