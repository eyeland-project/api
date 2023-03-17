import { Model } from "sequelize";

export interface Institution {
  id_institution: number;
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
}

export type InstitutionCreation = Omit<Institution, "id_institution">;
