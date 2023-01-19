export interface Link {
    id_link: number;
    tema: string;
    url_dir: string;
    id_task: number;
}

export type LinkCreation = Omit<Link, "id_link">;

export type LinkModel = Model<Link, LinkCreation>;