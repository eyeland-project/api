import { type } from "os";
import PartialBy from "./PartialBy";
import { Model } from "sequelize";

export interface Pregunta {
    id_pregunta: number;
    pregunta: string;
    imagen: string | undefined | null;
    audio: string | undefined | null;
    video: string | undefined | null;
    retroalimentacion: string | undefined | null;
    tipo: "multiple" | "audio";
    examen: boolean;
    id_task: number;
    orden: number;
};

export type PreguntaCreation = PartialBy<Omit<Pregunta, "id_pregunta">, 'imagen' | 'audio' | 'video' | 'retroalimentacion'>;

export interface PreguntaModel extends Model<Pregunta, PreguntaCreation>, Pregunta{};