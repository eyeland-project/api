import { Model, ForeignKey } from "sequelize";

export interface Question {
    id_question: number;
    id_task_stage: ForeignKey<number>;
    question_order: number;
    content: string;
    audio_url?: string;
    video_url?: string;
    type: string;
    img_alt?: string;
    img_url?: string;
    deleted: boolean;
};

export type QuestionCreation = Omit<Question, 'id_question'>;
