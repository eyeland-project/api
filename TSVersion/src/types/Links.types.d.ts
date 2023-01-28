import { Model, ForeignKey } from "sequelize";

export interface Link {
    id_link: number;
    tema: string;
    url_dir: string;
    id_task: ForeignKey<number>;
}

export type LinkCreation = Omit<Link, "id_link">;

export interface LinkModel extends Model<Link, LinkCreation>, Link{};