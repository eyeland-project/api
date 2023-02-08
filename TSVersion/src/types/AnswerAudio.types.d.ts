import { Model, ForeignKey } from "sequelize";

export interface AnswerAudio {
    id_answer_audio: number;
    id_answer: ForeignKey<number>;
    topic: string;
    url: string;
};

export type AnswerAudioCreation = Omit<AnswerAudio, 'id_answer_audio'>;

export interface AnswerAudioModel extends Model<AnswerAudio, AnswerAudioCreation>, AnswerAudio { };
