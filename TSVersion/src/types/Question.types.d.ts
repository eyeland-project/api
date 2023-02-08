import { Model, ForeignKey } from "sequelize";

export interface Question {
    id_question: number;
    id_task: ForeignKey<number>;
    content: string;
    audio_url?: string;
    video_url?: string;
    type: string;
    question_order: number;
    img_alt?: string;
    img_url?: string;
    deleted: boolean;
};

export type QuestionCreation = Omit<Question, 'id_question'>;

export interface QuestionModel extends Model<Question, QuestionCreation>, Question{};
