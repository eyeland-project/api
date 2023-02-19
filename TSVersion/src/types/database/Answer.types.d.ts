import { Model, ForeignKey, DataTypes } from "sequelize";

export interface Answer {
    id_answer: number;
    id_question: ForeignKey<number>;
    id_option?: ForeignKey<number> | null;
    id_team?: ForeignKey<number> | null;
    id_task_attempt: ForeignKey<number>;
    answer_seconds: number;
    audio1_url?: string | null;
    audio2_url?: string | null;
};

export type AnswerCreation = Omit<Answer, 'id_answer'>;
