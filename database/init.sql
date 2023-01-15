-- THIS IS A POSTGRESQL INITIALIZATION FILE
DROP DATABASE IF EXISTS mydb;
CREATE DATABASE mydb;
\connect mydb;

-- CREATING TABLES
-- create table task
create table Tasks (
    ID_Task serial not null,
    Nombre varchar(255) not null,
    Descripcion varchar(255) not null,
    Orden INTEGER not null,
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
    ID_Task INTEGER not null,
    Tema varchar(255) not null,
    Url_dir varchar(255) not null,
    -- CONSTRAINTS
    constraint pk_link primary key (ID_Link),
    constraint fk_task foreign key (ID_Task) references Tasks(ID_Task)
);

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
    ID_Task INTEGER not null,
    Orden integer not null,
    -- CONSTRAINTS
    constraint pk_pregunta primary key (ID_Pregunta),
    constraint fk_task foreign key (ID_Task) references Tasks(ID_Task),
    -- unique key with ID_Task and Orden
    constraint uk_constr unique (ID_Task, Orden, Examen)
);

-- CREATING TABLE respuestas
create table Respuestas (
    ID_Respuesta serial not null,
    Contenido varchar(255) not null,
    Correcta boolean not null,
    ID_Pregunta INTEGER not null,
    -- CONSTRAINTS
    constraint pk_respuesta primary key (ID_Respuesta),
    constraint fk_pregunta foreign key (ID_Pregunta) references Preguntas(ID_Pregunta)
);

-- create table Instituciones
create table Instituciones (
    ID_Institucion serial not null,
    Nombre varchar(255) not null,
    NIT varchar(255) not null,
    Direccion varchar(255) not null,
    Ciudad varchar(255) not null,
    Pais varchar(255) not null,
    Telefono varchar(255) not null,
    Email varchar(255) not null,
    -- CONSTRAINTS
    constraint pk_institucion primary key (ID_Institucion)
);
-- create table Profesores
create table Profesores (
    ID_Profesor serial not null,
    Nombre varchar(255) not null,
    Apellido varchar(255) not null,
    Email varchar(255) not null,
    Username varchar(255) not null,
    Password varchar(255) not null,
    ID_Institucion INTEGER not null,
    -- CONSTRAINTS
    constraint pk_profesor primary key (ID_Profesor),
    constraint fk_institucion_profesor foreign key (ID_Institucion) references Instituciones(ID_Institucion)
);

-- create table Cursos
create table Cursos (
    ID_Curso serial not null,
    Nombre varchar(255) not null,
    Descripcion varchar(255),
    ID_Profesor INTEGER not null,
    ID_Institucion INTEGER not null,
    Status boolean not null default false,
    -- CONSTRAINTS
    constraint pk_curso primary key (ID_Curso),
    constraint fk_profesor foreign key (ID_Profesor) references Profesores(ID_Profesor),
    constraint fk_institucion_curso foreign key (ID_Institucion) references Instituciones(ID_Institucion)
);

-- create table Estudiantes
create table Estudiantes (
    ID_Estudiante serial not null,
    Nombre varchar(255) not null,
    Apellido varchar(255) not null,
    Email varchar(255) not null,
    Username varchar(255) not null,
    Password varchar(255) not null,
    ID_Curso INTEGER not null,
    -- CONSTRAINTS
    constraint pk_estudiante primary key (ID_Estudiante),
    -- email as an unique key
    constraint uk_email_estudiantes unique (Email),
    -- foreign key to Curso
    constraint fk_curso foreign key (ID_Curso) references Cursos(ID_Curso)
);

-- create table Grupos
-- * Every group has 3 students
create table Grupos (
    ID_Grupo serial not null,
    -- ID_Curso serial not null,
    Nombre varchar(255) not null,
    Token varchar(255) not null,
    ID_Estudiante1 INTEGER not null,
    ID_Estudiante2 INTEGER null,
    ID_Estudiante3 INTEGER null,
    AvailableTasks INTEGER not null,
    -- CONSTRAINTS
    constraint pk_grupo primary key (ID_Grupo),
    -- constraint fk_curso foreign key (ID_Curso) references Curso(ID_Curso),
    constraint fk_estudiante1 foreign key (ID_Estudiante1) references Estudiantes(ID_Estudiante),
    constraint fk_estudiante2 foreign key (ID_Estudiante2) references Estudiantes(ID_Estudiante),
    constraint fk_estudiante3 foreign key (ID_Estudiante3) references Estudiantes(ID_Estudiante),
    foreign key (AvailableTasks) references Tasks(ID_Task)
);

ALTER TABLE Estudiantes ADD COLUMN GrupoActual INTEGER NULL REFERENCES Grupos(ID_Grupo);

create table Admins (
    ID_Admin serial not null,
    Nombre varchar(255) not null,
    Apellido varchar(255) not null,
    Email varchar(255) not null,
    Username varchar(255) not null,
    Password varchar(255) not null,
    -- CONSTRAINTS
    constraint pk_admin primary key (ID_Admin),
    -- email as an unique key
    constraint uk_email_admin unique (Email)
);

-- TODO: create table Animal
-- TODO: create table Historial

-- INSERTING DATA
-- insert into task
insert into Tasks (Nombre, Descripcion, Orden, MensajePreTask, MensajeInTask, MensajePosTask) values ('Task 1', 'Description 1', 1, 'MensajePreTask1', 'MensajeInTask1', 'MensajePosTask1');

-- insert into links
insert into Links (ID_Task, Tema, Url_dir) values (1, 'google', 'http://www.google.com');
insert into Links (ID_Task, Tema, Url_dir) values (1, 'Generado por Copilot', 'https://www.youtube.com/watch?v=is4RZQLodKU');

-- insert into preguntas
insert into Preguntas (Pregunta, Retroalimentacion, Tipo, Examen, ID_Task, Orden) values ('¿Cuál es el secreto de la vida?', 'Retroalimentacion1', 'multiple', false, 1, 1);
insert into Preguntas (Pregunta, Retroalimentacion, Tipo, Examen, ID_Task, Orden) values ('¿La repuesta es sí?', 'Retroalimentacion2', 'multiple', false, 1, 2);
insert into Preguntas (Pregunta, Retroalimentacion, Tipo, Examen, ID_Task, Orden) values ('¿La repuesta es no?', 'Retroalimentacion3', 'multiple', false, 1, 3);
insert into Preguntas (Pregunta, Retroalimentacion, Tipo, Examen, ID_Task, Orden) values ('esto es del postask?', 'Retroalimentacion3', 'multiple', true, 1, 1);
insert into Preguntas (Pregunta, Retroalimentacion, Tipo, Examen, ID_Task, Orden) values ('graba audio', 'Retroalimentacion4', 'audio', true, 1, 2);

-- insert into respuestas
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('', false, 1);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('La amista', false, 1);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('El money', false, 1);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('La tuya por si acaso', true, 1);

insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('sí', true, 2);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('no', true, 2);

insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('sí', false, 3);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('no', true, 3);

insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('sí', false, 4);
insert into Respuestas (Contenido, Correcta, ID_Pregunta) values ('no', true, 4);

-- *INSERTANDO USUARIOS E INSTITUCIONES DE PRUEBA
-- insert into Instituciones
insert into Instituciones (Nombre, NIT, Direccion, Ciudad, Pais, Telefono, Email) values ('Institución de prueba', '123456789', 'Cra 45 # 23-67', 'Barranquilla', 'Colombia', '1234567', 'prueba@test.com');

-- insert into Profesores
insert into Profesores (Nombre, Apellido, Email, Username, Password, ID_Institucion) values ('Profesor', 'Prueba', 'professor@test.com', 'professor', 'professor', 1);

-- insert into Cursos
insert into Cursos (Nombre, Descripcion, ID_Profesor, ID_Institucion) values ('Curso de prueba', 'Curso de prueba para la aplicación', 1, 1);

-- insert into Estudiantes
insert into Estudiantes (Nombre, Apellido, Email, Username, Password, ID_Curso) values ('Estudiante', 'Prueba', 'student@test.com', 'student', 'student', 1);

-- insert into Administradores
insert into Admins (Nombre, Apellido, Email, Username, Password) values ('Administrador', 'Prueba', 'admin@test.com', 'admin', 'pass123');