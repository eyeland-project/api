-- THIS IS A POSTGRESQL INITIALIZATION FILE
CREATE DATABASE mydb;
\connect mydb;

-- CREATING TABLES
-- create table task
create table Tasks (
    ID_Task serial not null,
    Nombre varchar(255) not null,
    Descripcion varchar(255) not null,
    Orden serial not null,
    MensajePreTask varchar(255),
    MensajeInTask varchar(255),
    MensajePosTask varchar(255),
    -- CONSTRAINTS
    constraint pk_task primary key (ID_Task),
    -- orden as an unique key
    constraint uk_orden unique (Orden)
);

-- create table links (pre-task)
create table Links (
    ID_Link serial not null,
    ID_Task serial not null,
    Tema varchar(255) not null,
    Url_dir varchar(255) not null,
    -- CONSTRAINTS
    constraint pk_link primary key (ID_Link),
    constraint fk_task foreign key (ID_Task) references Tasks(ID_Task)
);

-- TODO: create table Estudiante
-- TODO: create table Profesor
-- TODO: create table Curso
-- TODO: create table Animal
-- TODO: create table Pregunta
-- TODO: create table Respuesta
-- TODO: create table Historial

-- INSERTING DATA
-- insert into task
insert into Tasks (Nombre, Descripcion, Orden) values ('Task 1', 'Description 1', 1);

-- insert into links
insert into Links (ID_Task, Tema, Url_dir) values (1, 'google', 'http://www.google.com');
insert into Links (ID_Task, Tema, Url_dir) values (1, 'Generado por Copilot', 'https://www.youtube.com/watch?v=is4RZQLodKU');
