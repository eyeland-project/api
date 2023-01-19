export interface Respuesta {
    id_respuesta: number;
    contenido: string;
    correcta: boolean;
    id_pregunta: number;
}

export type RespuestaCreation = Omit<Respuesta, "id_respuesta">;

export type RespuestaModel = Model<Respuesta, RespuestaCreation>;