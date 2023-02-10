-- THIS IS A POSTGRESQL INITIALIZATION FILE
-- TODO: check order of creation of tables to avoid errors
DROP DATABASE IF EXISTS mydb;
CREATE DATABASE mydb;
\connect mydb;

-- CREATING TABLES
-- CREATING TABLE task
CREATE TABLE task (
    id_task SMALLSERIAL NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    task_order SMALLINT NOT NULL,
    thumbnail_url VARCHAR(2048),
    msg_pretask VARCHAR(1000),
    msg_duringtask VARCHAR(1000),
    msg_postask VARCHAR(1000),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_task PRIMARY KEY (id_task),
    CONSTRAINT uk_task_task_order UNIQUE (task_order)
);

-- CREATING TABLE links (pre-task)
CREATE TABLE link (
    id_link SERIAL NOT NULL,
    id_task SMALLINT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_link PRIMARY KEY (id_link),
    CONSTRAINT fk_link_task FOREIGN KEY (id_task) REFERENCES task(id_task)
);

-- CREATING TABLE preguntas
CREATE TABLE question (
    id_question SERIAL NOT NULL,
    id_task SMALLINT NOT NULL,
    content VARCHAR(100) NOT NULL,
    audio_url VARCHAR(2048),
    video_url VARCHAR(2048),
    type VARCHAR(50) NOT NULL,
    question_order SMALLINT NOT NULL,
    img_alt VARCHAR(50),
    img_url VARCHAR(2048),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_question PRIMARY KEY (id_question),
    CONSTRAINT fk_question_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT uk_question_constr UNIQUE (id_task, question_order),
    CONSTRAINT check_question_type CHECK (type IN ('select', 'audio'))
);

-- CREATING TABLE respuestas
CREATE TABLE option (
    id_option SERIAL NOT NULL,
    id_question INTEGER NOT NULL,
    feedback VARCHAR(100),
    content VARCHAR(1000) NOT NULL,
    correct BOOLEAN NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_option PRIMARY KEY (id_option),
    CONSTRAINT fk_option_question FOREIGN KEY (id_question) REFERENCES question(id_question)
);

-- CREATING TABLE Instituciones
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

-- CREATING TABLE Administradores
CREATE TABLE admin (
    id_admin SMALLSERIAL NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_admin PRIMARY KEY (id_admin),
    CONSTRAINT uk_admin_email UNIQUE (email),
    CONSTRAINT uk_admin_username UNIQUE (username)
);

-- CREATING TABLE Profesores
CREATE TABLE teacher (
    id_teacher SMALLSERIAL NOT NULL,
    id_institution SMALLINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_teacher PRIMARY KEY (id_teacher),
    CONSTRAINT fk_teacher_institution FOREIGN KEY (id_institution) REFERENCES institution(id_institution),
    CONSTRAINT uk_teacher_email UNIQUE (email),
    CONSTRAINT uk_teacher_username UNIQUE (username)
);

-- CREATING TABLE Cursos
CREATE TABLE course (
    id_course SMALLSERIAL NOT NULL,
    id_teacher SMALLINT NOT NULL,
    id_institution SMALLINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    status BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_course PRIMARY KEY (id_course),
    CONSTRAINT fk_course_teacher FOREIGN KEY (id_teacher) REFERENCES teacher(id_teacher),
    CONSTRAINT fk_course_institution FOREIGN KEY (id_institution) REFERENCES institution(id_institution)
);

-- CREATING TABLE Grupos
CREATE TABLE team (
    id_team SERIAL NOT NULL,
    id_course SMALLINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    code CHAR(6),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    -- CONSTRAINTS
    CONSTRAINT pk_team PRIMARY KEY (id_team),
    CONSTRAINT fk_team_course FOREIGN KEY (id_course) REFERENCES course(id_course)
);

-- CREATING TABLE Estudiantes
CREATE TABLE student (
    id_student SERIAL NOT NULL,
    id_course SMALLINT NOT NULL,
    current_team INTEGER,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(50) NOT NULL,
    blindness VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_student PRIMARY KEY (id_student),
    CONSTRAINT fk_student_course FOREIGN KEY (id_course) REFERENCES course(id_course),
    CONSTRAINT fk_student_team FOREIGN KEY (current_team) REFERENCES team(id_team),
    CONSTRAINT uk_student_email UNIQUE (email),
    CONSTRAINT uk_student_username UNIQUE (username),
    CONSTRAINT check_student_blindness CHECK (blindness IN ('total', 'partial', 'none'))
);

-- CREATING TABLE Estudiantes_Grupos
CREATE TABLE student_team (
    id_student_team SERIAL NOT NULL,
    id_student INTEGER NOT NULL,
    id_team INTEGER NOT NULL,
    power VARCHAR(20) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_student_team PRIMARY KEY (id_student_team),
    CONSTRAINT fk_student_team_student FOREIGN KEY (id_student) REFERENCES student(id_student),
    CONSTRAINT fk_student_team_team FOREIGN KEY (id_team) REFERENCES team(id_team),
    CONSTRAINT check_student_team_power CHECK (power IN ('super_hearing', 'memory_pro', 'super_radar'))
);

CREATE TABLE student_task (
    id_student_task SERIAL NOT NULL,
    id_student INTEGER NOT NULL,
    id_task SMALLINT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_student_task PRIMARY KEY (id_student_task),
    CONSTRAINT fk_student_task_student FOREIGN KEY (id_student) REFERENCES student(id_student),
    CONSTRAINT fk_student_task_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT uk_student_task UNIQUE (id_student, id_task)
);

-- CREATING TABLE
CREATE TABLE task_attempt (
    id_task_attempt SERIAL NOT NULL,
    id_task SMALLINT NOT NULL,
    id_team INTEGER,
    id_student INTEGER,
    task_phase VARCHAR(20) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    -- CONSTRAINTS
    CONSTRAINT pk_task_attempt PRIMARY KEY (id_task_attempt),
    CONSTRAINT fk_task_attempt_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT fk_task_attempt_team FOREIGN KEY (id_team) REFERENCES team(id_team),
    CONSTRAINT fk_task_attempt_student FOREIGN KEY (id_student) REFERENCES student(id_student),
    CONSTRAINT check_task_attempt_task_phase CHECK (task_phase IN ('pretask', 'duringtask', 'postask')),
    CONSTRAINT check_task_attempt_by CHECK (id_team IS NOT NULL OR id_student IS NOT NULL)
);

-- CREATING TABLE
CREATE TABLE answer (
    id_answer SERIAL NOT NULL,
    id_question INTEGER NOT NULL,
    id_option INTEGER NOT NULL,
    id_task_attempt INTEGER NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- CONSTRAINTS
    CONSTRAINT pk_answer PRIMARY KEY (id_answer),
    CONSTRAINT fk_answer_question FOREIGN KEY (id_question) REFERENCES question(id_question),
    CONSTRAINT fk_answer_option FOREIGN KEY (id_option) REFERENCES option(id_option),
    CONSTRAINT fk_answer_task_attempt FOREIGN KEY (id_task_attempt) REFERENCES task_attempt(id_task_attempt)
);

-- CREATING TABLE
CREATE TABLE answer_audio (
    id_answer_audio SERIAL NOT NULL,
    id_answer INTEGER NOT NULL,
    topic VARCHAR(100) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_answer_audio PRIMARY KEY (id_answer_audio),
    CONSTRAINT fk_answer_audio_answer FOREIGN KEY (id_answer) REFERENCES answer(id_answer)
);

-- TODO: create table Animal
-- TODO: create table Historial

-- FUNCTIONS
-- INSERT INTO student_task when a new student is inserted v1 (assumes there are 5 tasks)
-- CREATE OR REPLACE FUNCTION insert_student_task_for_new_student()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Insert 5 records into the student_task table for the new student
--   FOR i IN 1..5 LOOP
--     INSERT INTO student_task (id_student, id_task)
--     VALUES (NEW.id_student, i); -- assuming that the ids of the tasks are 1, 2, 3, 4, 5
--   END LOOP;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- INSERT INTO student_task when a new student is inserted v2 (works for any number of tasks)
CREATE OR REPLACE FUNCTION insert_student_task_for_new_student()
RETURNS TRIGGER AS $$
DECLARE
    task_count SMALLINT;
    new_student_id INTEGER;
    task_id SMALLINT; -- to iterate over the tasks
BEGIN
    -- Get the number of tasks
    SELECT COUNT(*) INTO task_count FROM task;
    -- Get the ID of the newly inserted student
    new_student_id = (SELECT id_student FROM student ORDER BY id_student DESC LIMIT 1);
    -- Insert a record into the student_task table for each task
    --   FOR task_id IN 1..task_count LOOP -- assuming that the ids of the tasks are 1, 2, 3, ..., task_count
    FOR task_id IN (SELECT id_task FROM task) LOOP
        RAISE NOTICE 'Inserting student_task for student % and task %', new_student_id, task_id;
        INSERT INTO student_task (id_student, id_task)
        VALUES (new_student_id, task_id);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_student_task_for_new_task()
RETURNS TRIGGER AS $$
DECLARE
    student_count INTEGER;
    new_task_id SMALLINT;
    student_id INTEGER; -- to iterate over the students
BEGIN
    -- Get the number of students
    SELECT COUNT(*) INTO student_count FROM student;
    -- Get the ID of the newly inserted task
    new_task_id = (SELECT id_task FROM task ORDER BY id_task DESC LIMIT 1);
    -- Insert a record into the student_task table for each student
    -- FOR student_id IN 1..student_count LOOP -- assuming that the ids of the students are 1, 2, 3, ..., student_count
    FOR student_id IN (SELECT id_student FROM student) LOOP
        RAISE NOTICE 'Inserting student_task for student % and task %', student_id, new_task_id;
        INSERT INTO student_task (id_student, id_task)
        VALUES (student_id, new_task_id);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
-- Trigger to insert records into the student_task table for each new student
CREATE TRIGGER insert_student_task_for_new_student_trigger
AFTER INSERT ON student
FOR EACH ROW
EXECUTE FUNCTION insert_student_task_for_new_student();

-- Trigger to insert records into the student_task table for each new task
CREATE TRIGGER insert_student_task_for_new_task_trigger
AFTER INSERT ON task
FOR EACH ROW
EXECUTE FUNCTION insert_student_task_for_new_task();

-- INSERTING DATA
-- INSERT INTO task
INSERT INTO task (name, description, task_order, msg_pretask, msg_duringtask, msg_postask) VALUES ('Task 1', 'Description for Task 1', 1, 'MensajePreTask1', 'MensajeDuringTask1', 'MensajePosTask1');
INSERT INTO task (name, description, task_order, msg_pretask, msg_duringtask, msg_postask) VALUES ('Task 2', 'Description for Task 2', 2, 'MensajePreTask2', 'MensajeDuringTask2', 'MensajePosTask2');
INSERT INTO task (name, description, task_order, msg_pretask, msg_duringtask, msg_postask) VALUES ('Task 3', 'Description for Task 3', 3, 'MensajePreTask3', 'MensajeDuringTask3', 'MensajePosTask3');
INSERT INTO task (name, description, task_order, msg_pretask, msg_duringtask, msg_postask) VALUES ('Task 4', 'Description for Task 4', 4, 'MensajePreTask4', 'MensajeDuringTask4', 'MensajePosTask4');
INSERT INTO task (name, description, task_order, msg_pretask, msg_duringtask, msg_postask) VALUES ('Task 5', 'Description for Task 5', 5, 'MensajePreTask5', 'MensajeDuringTask5', 'MensajePosTask5');

-- INSERT INTO links
INSERT INTO link (id_task, topic, url) VALUES (1, 'google', 'http://www.google.com');
INSERT INTO link (id_task, topic, url) VALUES (1, 'Generado por Copilot', 'https://www.youtube.com/watch?v=is4RZQLodKU');

-- INSERT INTO preguntas
INSERT INTO question (id_task, content, audio_url, video_url, type, question_order, img_alt, img_url) VALUES (1, '¿Cuál es el secreto de la vida?', NULL, NULL, 'select', 1, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, question_order, img_alt, img_url) VALUES (1, '¿La repuesta es sí?', NULL, NULL, 'select', 2, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, question_order, img_alt, img_url) VALUES (1, '¿La repuesta es no?', NULL, NULL, 'select', 3, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, question_order, img_alt, img_url) VALUES (2, 'esto es del postask?', NULL, NULL, 'select', 1, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, question_order, img_alt, img_url) VALUES (2, 'graba audio', NULL, NULL, 'select', 2, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, question_order, img_alt, img_url) VALUES (2, 'Auxilio, Camilo nos tiene esclavizados', NULL, NULL, 'select', 3, NULL, NULL);
INSERT INTO question (id_task, content, audio_url, video_url, type, question_order, img_alt, img_url) VALUES (2, 'Esto no es joda', NULL, NULL, 'select', 4, NULL, NULL);

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
