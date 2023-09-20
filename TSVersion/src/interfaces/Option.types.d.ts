import { ForeignKey } from "sequelize";

export interface Option {
  id_option: number;
  id_question: ForeignKey<number>;
  feedback?: string | null;
  content: string;
  correct: boolean;
  main_img_url?: string | null;
  main_img_alt?: string | null;
  preview_img_url?: string | null;
  preview_img_alt?: string | null;
  deleted: boolean;
}

export type OptionCreation = Omit<Option, "id_option", "deleted">;
