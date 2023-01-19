export interface Profesor {
    id_profesor: number;
    nombre: string;
    apellido: string;
    email: string;
    username: string;
    password: string;
    id_institucion: number;
};

export type ProfesorCreation = Omit<Profesor, 'id_profesor'>;

export type ProfesorModel = Model<Profesor, ProfesorCreation>;