export interface Pregunta {
    id_pregunta: number;
    pregunta: string;
    imagen: string | undefined | null;
    audio: string | undefined | null;
    video: string | undefined | null;
    retroalimentacion: string | undefined | null;
    tipo: string;
    examen: boolean;
    id_task: number;
    orden: number;
};