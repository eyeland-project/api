import { Model } from "sequelize";

export interface Institution {
  id_institution: number;
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  phone_code: string;
  phone_number: string;
  email: string;
  website_url?: string | null;
}

export type InstitutionCreation = Omit<Institution, "id_institution">;
