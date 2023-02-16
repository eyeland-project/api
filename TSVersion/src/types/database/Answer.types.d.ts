import { Model, ForeignKey, DataTypes } from "sequelize";

export interface Answer {
    id_answer: number;
    id_question: ForeignKey<number>;
    id_option?: ForeignKey<number>;
    id_team?: ForeignKey<number>;
    id_task_attempt: ForeignKey<number>;
    answer_seconds: number;
    audio1_url?: string;
    audio2_url?: string;
};

export type AnswerCreation = Omit<Answer, 'id_answer'>;
