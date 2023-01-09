-- Connecting to the database
\connect mydb;

-- CREATING TABLES
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
    ID_Institucion serial not null,
    -- CONSTRAINTS
    constraint pk_profesor primary key (ID_Profesor)
    constraint fk_institucion foreign key (ID_Institucion) references Institucion(ID_Institucion)
);

-- create table Cursos
create table Cursos (
    ID_Curso serial not null,
    Nombre varchar(255) not null,
    Descripcion varchar(255),
    ID_Profesor serial not null,
    ID_Institucion serial not null,
    -- CONSTRAINTS
    constraint pk_curso primary key (ID_Curso),
    constraint fk_profesor foreign key (ID_Profesor) references Profesor(ID_Profesor),
    constraint fk_institucion foreign key (ID_Institucion) references Institucion(ID_Institucion)
);

-- create table Estudiantes
create table Estudiantes (
    ID_Estudiante serial not null,
    Nombre varchar(255) not null,
    Apellido varchar(255) not null,
    Email varchar(255) not null,
    Username varchar(255) not null,
    Password varchar(255) not null,
    ID_Curso serial not null,
    -- CONSTRAINTS
    constraint pk_estudiante primary key (ID_Estudiante),
    -- email as an unique key
    constraint uk_email unique (Email)
    -- foreign key to Curso
    constraint fk_curso foreign key (ID_Curso) references Curso(ID_Curso)
);

-- create table Grupos
-- * Every group has 3 students
create table Grupos (
    ID_Grupo serial not null,
    -- ID_Curso serial not null,
    Nombre varchar(255) not null,
    Token varchar(255) not null,
    ID_Estudiante1 serial not null,
    ID_Estudiante2 serial not null,
    ID_Estudiante3 serial not null,
    -- CONSTRAINTS
    constraint pk_grupo primary key (ID_Grupo),
    -- constraint fk_curso foreign key (ID_Curso) references Curso(ID_Curso),
    constraint fk_estudiante1 foreign key (ID_Estudiante1) references Estudiante(ID_Estudiante),
    constraint fk_estudiante2 foreign key (ID_Estudiante2) references Estudiante(ID_Estudiante),
    constraint fk_estudiante3 foreign key (ID_Estudiante3) references Estudiante(ID_Estudiante)
);

-- create table Administradores
create table Administradores (
    ID_Administrador serial not null,
    Nombre varchar(255) not null,
    Apellido varchar(255) not null,
    Email varchar(255) not null,
    Username varchar(255) not null,
    Password varchar(255) not null,
    -- CONSTRAINTS
    constraint pk_administrador primary key (ID_Administrador)
);

-- INSERTING SOME DATA
-- insert into Instituciones
insert into Instituciones (Nombre, NIT, Direccion, Ciudad, Pais, Telefono, Email) values ('Institución de prueba', '123456789', 'Cra 45 # 23-67', 'Barranquilla', 'Colombia', '1234567', 'prueba@test.com');

-- insert into Profesores
insert into Profesores (Nombre, Apellido, Email, Username, Password, ID_Institucion) values ('Profesor', 'Prueba', 'professor@test.com', 'professor', 'professor', 1);

-- insert into Cursos
insert into Cursos (Nombre, Descripcion, ID_Profesor, ID_Institucion) values ('Curso de prueba', 'Curso de prueba para la aplicación', 1, 1);

-- insert into Estudiantes
insert into Estudiantes (Nombre, Apellido, Email, Username, Password, ID_Curso) values ('Estudiante', 'Prueba', 'student@test.com', 'student', 'student', 1);

-- insert into Administradores
insert into Administradores (Nombre, Apellido, Email, Username, Password) values ('Administrador', 'Prueba', 'admin@test.com', 'admin', 'pass123');
