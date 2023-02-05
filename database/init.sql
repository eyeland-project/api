-- THIS IS A POSTGRESQL INITIALIZATION FILE
-- TODO: check order of creation of tables to avoid errors
DROP DATABASE IF EXISTS mydb;
CREATE DATABASE mydb;
\connect mydb;

-- CREATING TABLES
-- create table task
CREATE TABLE task (
    id_task SMALLSERIAL NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    task_order SMALLINT NOT NULL,
    msg_pretask VARCHAR(1000),
    msg_intask VARCHAR(1000),
    msg_postask VARCHAR(1000),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_task PRIMARY KEY (id_task),
    CONSTRAINT uk_task_task_order UNIQUE (task_order)
);

-- create table links (pre-task)
CREATE TABLE link (
    id_link SERIAL NOT NULL,
    id_task SMALLSERIAL NOT NULL,
    topic VARCHAR(100) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_link PRIMARY KEY (id_link),
    CONSTRAINT fk_link_task FOREIGN KEY (id_task) REFERENCES task(id_task)
);

-- CREATING TABLE preguntas
CREATE TABLE question (
    id_question SERIAL NOT NULL,
    id_task SMALLSERIAL NOT NULL,
    content VARCHAR(100) NOT NULL,
    audio_url VARCHAR(2048),
    video_url VARCHAR(2048),
    type VARCHAR(50) NOT NULL,
    exam BOOLEAN NOT NULL,
    question_order SMALLINT NOT NULL,
    img_alt VARCHAR(50),
    img_url VARCHAR(2048),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_question PRIMARY KEY (id_question),
    CONSTRAINT fk_question_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT uk_question_constr UNIQUE (id_task, question_order, exam)
);

-- CREATING TABLE respuestas
CREATE TABLE option (
    id_option SERIAL NOT NULL,
    id_question SERIAL NOT NULL,
    feedback VARCHAR(100),
    content VARCHAR(1000) NOT NULL,
    correct BOOLEAN NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_option PRIMARY KEY (id_option),
    CONSTRAINT fk_option_question FOREIGN KEY (id_question) REFERENCES question(id_question)
);

-- create table Instituciones
CREATE TABLE institution (
    id_institution SMALLSERIAL NOT NULL,
    name VARCHAR(100) NOT NULL,
    nit CHAR(9) NOT NULL,
    address VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(320) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_institution PRIMARY KEY (id_institution),
    CONSTRAINT uk_institution_nit UNIQUE (nit)
);

-- create table Profesores
CREATE TABLE teacher (
    id_teacher SERIAL NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password CHAR(60) NOT NULL,
    id_institution SMALLSERIAL NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_teacher PRIMARY KEY (id_teacher),
    CONSTRAINT fk_teacher_institution FOREIGN KEY (id_institution) REFERENCES institution(id_institution),
    CONSTRAINT uk_teacher_email UNIQUE (email),
    CONSTRAINT uk_teacher_username UNIQUE (username)
);

-- create table Cursos
CREATE TABLE course (
    id_course SERIAL NOT NULL,
    id_teacher SERIAL NOT NULL,
    id_institution SMALLSERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    status BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_course PRIMARY KEY (id_course),
    CONSTRAINT fk_course_teacher FOREIGN KEY (id_teacher) REFERENCES teacher(id_teacher),
    CONSTRAINT fk_course_institution FOREIGN KEY (id_institution) REFERENCES institution(id_institution)
);

-- create table Grupos
CREATE TABLE team (
    id_team SERIAL NOT NULL,
    id_course SERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    code CHAR(6),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    -- CONSTRAINTS
    CONSTRAINT pk_team PRIMARY KEY (id_team),
    CONSTRAINT fk_team_course FOREIGN KEY (id_course) REFERENCES course(id_course)
);

-- create table Estudiantes
CREATE TABLE student (
    id_student SERIAL NOT NULL,
    id_course SERIAL NOT NULL,
    current_team INTEGER,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(50) NOT NULL,
    blindness VARCHAR(50) NOT NULL,
    password CHAR(60) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_student PRIMARY KEY (id_student),
    CONSTRAINT fk_student_course FOREIGN KEY (id_course) REFERENCES course(id_course),
    CONSTRAINT fk_student_team FOREIGN KEY (current_team) REFERENCES team(id_team),
    CONSTRAINT uk_student_email UNIQUE (email),
    CONSTRAINT uk_student_username UNIQUE (username),
    CONSTRAINT check_student_blindness CHECK (blindness IN ('total', 'partial', 'none'))
);

-- create table Estudiantes_Grupos
CREATE TABLE student_team (
    id_student_team SERIAL NOT NULL,
    power VARCHAR(20) NOT NULL,
    id_student SERIAL NOT NULL,
    id_team SERIAL NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_student_team PRIMARY KEY (id_student_team),
    CONSTRAINT fk_student_team_student FOREIGN KEY (id_student) REFERENCES student(id_student),
    CONSTRAINT fk_student_team_team FOREIGN KEY (id_team) REFERENCES team(id_team),
    CONSTRAINT check_student_team_power CHECK (power IN ('super_hearing', 'memory_pro', 'super_radar'))
);

-- create table Administradores
CREATE TABLE admin (
    id_admin SERIAL NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password CHAR(60) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_admin PRIMARY KEY (id_admin),
    CONSTRAINT uk_admin_email UNIQUE (email),
    CONSTRAINT uk_admin_username UNIQUE (username)
);

-- create table 
CREATE TABLE task_attempt (
    id_task_attempt SERIAL NOT NULL,
    id_task SMALLSERIAL NOT NULL,
    id_team SERIAL NOT NULL,
    id_student SERIAL NOT NULL,
    task_phase SMALLINT NOT NULL,
    success BOOLEAN NOT NULL,
    completed BOOLEAN NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_task_attempt PRIMARY KEY (id_task_attempt),
    CONSTRAINT fk_task_attempt_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT fk_task_attempt_team FOREIGN KEY (id_team) REFERENCES team(id_team),
    CONSTRAINT fk_task_attempt_student FOREIGN KEY (id_student) REFERENCES student(id_student)
);

-- create table
CREATE TABLE answer (
    id_answer SERIAL NOT NULL,
    id_question SERIAL NOT NULL,
    id_option SERIAL NOT NULL,
    id_task_attempt SERIAL NOT NULL,
    count INTEGER NOT NULL,
    time_stamp TIMESTAMP NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_answer PRIMARY KEY (id_answer),
    CONSTRAINT fk_answer_question FOREIGN KEY (id_question) REFERENCES question(id_question),
    CONSTRAINT fk_answer_option FOREIGN KEY (id_option) REFERENCES option(id_option),
    CONSTRAINT fk_answer_task_attempt FOREIGN KEY (id_task_attempt) REFERENCES task_attempt(id_task_attempt)
);

-- create table
CREATE TABLE answer_audio (
    id_answer_audio SERIAL NOT NULL,
    id_answer SERIAL NOT NULL,
    topic VARCHAR(100) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_answer_audio PRIMARY KEY (id_answer_audio),
    CONSTRAINT fk_answer_audio_answer FOREIGN KEY (id_answer) REFERENCES answer(id_answer)
);

-- TODO: create table Animal
-- TODO: create table Historial

-- INSERTING DATA
-- INSERT INTO task
INSERT INTO task (name, description, task_order, msg_pretask, msg_intask, msg_postask) VALUES ('Task 1', 'Description 1', 1, 'MensajePreTask1', 'MensajeInTask1', 'MensajePosTask1');

-- INSERT INTO links
INSERT INTO link (id_task, topic, url) VALUES (1, 'google', 'http://www.google.com');
INSERT INTO link (id_task, topic, url) VALUES (1, 'Generado por Copilot', 'https://www.youtube.com/watch?v=is4RZQLodKU');

-- INSERT INTO preguntas
INSERT INTO question (id_task, content, audio_url, video_url, type, exam, question_order, img_alt, img_url) VALUES (1, '¿Cuál es el secreto de la vida?', NULL, NULL, 'multiple', false, 1, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, exam, question_order, img_alt, img_url) VALUES (1, '¿La repuesta es sí?', NULL, NULL, 'multiple', false, 2, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, exam, question_order, img_alt, img_url) VALUES (1, '¿La repuesta es no?', NULL, NULL, 'multiple', false, 3, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, exam, question_order, img_alt, img_url) VALUES (1, 'esto es del postask?', NULL, NULL, 'multiple', true, 1, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, exam, question_order, img_alt, img_url) VALUES (1, 'graba audio', NULL, NULL, 'audio', true, 2, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, exam, question_order, img_alt, img_url) VALUES (1, 'Auxilio, Camilo nos tiene esclavizados', NULL, NULL, 'video', true, 3, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, exam, question_order, img_alt, img_url) VALUES (1, 'Esto no es joda', NULL, NULL, 'video', true, 4, NULL, NULL);

-- INSERT INTO respuestas
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (1, 1, 'Retroalimentacion1', '', false);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (2, 1, 'Retroalimentacion1', 'La amista', false);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (3, 1, 'Retroalimentacion1', 'El money', false);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (4, 1, 'Retroalimentacion1', 'La tuya por si acaso', true);

INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (5, 2, 'Retroalimentacion2', 'sí', true);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (6, 2, 'Retroalimentacion2', 'no', true);

INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (7, 3, 'Retroalimentacion3', 'sí', false);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (8, 3, 'Retroalimentacion3', 'no', true);

INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (9, 4, 'Retroalimentacion4', 'sí', false);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (10, 4, 'Retroalimentacion4', 'no', true);

INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (11, 5, 'Retroalimentacion5', 'sí', false);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (12, 5, 'Retroalimentacion5', 'no', true);

INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (13, 6, 'Retroalimentacion6', 'sí', false);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (14, 6, 'Retroalimentacion6', 'no', true);

INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (15, 7, 'Retroalimentacion7', 'sí', false);
INSERT INTO option (id_option, id_question, feedback, content, correct) VALUES (16, 7, 'Retroalimentacion7', 'no', true);

-- *INSERTANDO USUARIOS E INSTITUCIONES DE PRUEBA
-- INSERT INTO Instituciones
INSERT INTO institution (id_institution, name, nit, address, city, country, phone, email) VALUES (1, 'Institución de prueba', '123456789', 'Cra 45 # 23-67', 'Barranquilla', 'Colombia', '1234567', 'prueba@test.com');

-- INSERT INTO Profesores
INSERT INTO teacher (id_teacher, id_institution, first_name, last_name, email, username, password) VALUES (1, 1, 'Profesor', 'Prueba', 'teacher@test.com', 'teacher', 'teacher');

-- INSERT INTO Cursos
INSERT INTO course (id_course, id_institution, id_teacher, name, description) VALUES (1, 1, 1, 'Curso de prueba', 'Curso de prueba para la aplicación');

-- INSERT INTO Equipos
INSERT INTO team (id_team, id_course, name) VALUES (1, 1, 'Equipo de prueba');

-- INSERT INTO Estudiantes
INSERT INTO student (id_student, id_course, first_name, last_name, email, username, current_team, blindness, password) VALUES (1, 1, 'Estudiante', 'Prueba', 'student@test.com', 'student', 1, 'none', 'pass123');
INSERT INTO student (id_student, id_course, first_name, last_name, email, username, current_team, blindness, password) VALUES (2, 1, 'Estudiante', 'Prueba', 'student2@test.com', 'student2', NULL, 'none', 'pass123');

-- INSERT INTO Administradores
INSERT INTO admin (id_admin, first_name, last_name, email, username, password) VALUES (1, 'Administrador', 'Prueba', 'admin@test.com', 'admin', 'pass123');
