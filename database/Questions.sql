-- THIS IS A POSTGRESQL FILE EXTENDING THE DATABASE
-- \connect mydb;

-- CREATING TABLE preguntas
create table Preguntas (
    ID_Pregunta serial not null,
    Pregunta varchar(255) not null,
    Imagen varchar(255),
    Audio varchar(255),
    Video varchar(255),
    Retroalimentacion varchar(255),
    Tipo varchar(255) not null,
    Examen boolean not null,
    ID_Task serial not null,
    Orden integer not null,
    -- CONSTRAINTS
    constraint pk_pregunta primary key (ID_Pregunta),
    constraint fk_task foreign key (ID_Task) references Tasks(ID_Task),
    -- unique key with ID_Task and Orden
    constraint uk_constr unique (ID_Task, Orden)
);

-- CREATING TABLE respuestas
create table Respuestas (
    ID_Respuesta serial not null,
    Contenido varchar(255) not null,
    Correcta boolean not null,
    ID_Pregunta serial not null,
    -- CONSTRAINTS
    constraint pk_respuesta primary key (ID_Respuesta),
    constraint fk_pregunta foreign key (ID_Pregunta) references Preguntas(ID_Pregunta)
);

-- INSERTING DATA
-- insert into preguntas
insert into Preguntas (Pregunta, Retroalimentacion, Tipo, Examen, ID_Task, Orden) values ('¿Cuál es el secreto de la vida?', 'Retroalimentacion1', 'multiple', false, 1, 1);
insert into Preguntas (Pregunta, Retroalimentacion, Tipo, Examen, ID_Task, Orden) values ('¿La repuesta es sí?', 'Retroalimentacion2', 'multiple', false, 1, 2);
insert into Preguntas (Pregunta, Retroalimentacion, Tipo, Examen, ID_Task, Orden) values ('¿La repuesta es no?', 'Retroalimentacion3', 'multiple', false, 1, 3);

-- insert into respuestas
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('', false, 1);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('La amista', false, 1);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('El money', false, 1);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('La tuya por si acaso', true, 1);

insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('sí', true, 2);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('no', true, 2);

insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('sí', false, 3);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('no', true, 3);