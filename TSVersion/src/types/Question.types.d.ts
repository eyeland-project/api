import { Model, ForeignKey } from "sequelize";

export interface Question {
    id_question: number;
    id_task_stage: ForeignKey<number>;
    question_order: number;
    content: string;
    audio_url?: string | null;
    video_url?: string | null;
    type: string;
    img_alt?: string | null;
    img_url?: string | null;
    deleted: boolean;
};

export type QuestionCreation = Omit<Question, 'id_question'>;
