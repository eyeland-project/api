import { Model } from "sequelize";

export interface Respuesta {
    id_respuesta: number;
    contenido: string;
    correcta: boolean;
    id_pregunta: number;
}

export type RespuestaCreation = Omit<Respuesta, "id_respuesta">;

export interface RespuestaModel extends Model<Respuesta, RespuestaCreation>, Respuesta{};