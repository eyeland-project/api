import { Model } from "sequelize";
import PartialBy from "./PartialBy";

export interface Release {
  id_release: number;
  version: string;
  url: string;
  active: boolean;
  created_at: Date;
}

export type ReleaseCreation = PartialBy<
  Omit<Release, "id_release" | "active"> | "created_at"
>;
