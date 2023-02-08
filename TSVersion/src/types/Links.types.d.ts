import { Model, ForeignKey } from "sequelize";

export interface Link {
    id_link: number;
    id_task: ForeignKey<number>;
    topic: string;
    url: string;
};

export type LinkCreation = Omit<Link, 'id_link'>;

export interface LinkModel extends Model<Link, LinkCreation>, Link{};
