import { Model, ForeignKey, DataTypes } from "sequelize";

export interface Answer {
    id_answer: number;
    id_question: ForeignKey<number>;
    id_option: ForeignKey<number>;
    id_task_attempt: ForeignKey<number>;
    count: number;
    start_time: Date;
    end_time: Date;
};

export type AnswerCreation = Omit<Answer, 'id_answer'>;

export interface AnswerModel extends Model<Answer, AnswerCreation>, Answer {}
