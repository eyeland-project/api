import { Model, ForeignKey } from "sequelize";

export interface Option {
    id_option: number;
    id_question: ForeignKey<number>;
    feedback: string | null;
    content: string;
    correct: boolean;
    deleted: boolean;
};

export type OptionCreation = Omit<Option, 'id_option'>;

export interface OptionModel extends Model<Option, OptionCreation>, Option { };
