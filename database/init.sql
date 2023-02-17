-- THIS IS A POSTGRESQL INITIALIZATION FILE
-- TODO: check order of creation of tables to avoid errors
DROP DATABASE IF EXISTS mydb;
CREATE DATABASE mydb;
\connect mydb;

-- CREATING TABLES
-- CREATING TABLE task
CREATE TABLE task (
    id_task SMALLSERIAL NOT NULL,
    task_order SMALLINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(100) NOT NULL,
    long_description VARCHAR(1000),
    keywords VARCHAR(50)[] NOT NULL DEFAULT '{}',
    thumbnail_url VARCHAR(2048),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_task PRIMARY KEY (id_task),
    CONSTRAINT uk_task_task_order UNIQUE (task_order)
);

-- CREATING TABLE task
CREATE TABLE task_stage (
    id_task_stage SMALLSERIAL NOT NULL,
    id_task SMALLINT NOT NULL,
    task_stage_order SMALLINT NOT NULL,
    description VARCHAR(100) NOT NULL,
    keywords VARCHAR(50)[] NOT NULL DEFAULT '{}',
    -- CONSTRAINTS
    CONSTRAINT pk_task_stage PRIMARY KEY (id_task_stage),
    CONSTRAINT pk_task_stage_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT uk_task_stage_constr UNIQUE (id_task, task_stage_order),
    CONSTRAINT check_task_stage_order CHECK (task_stage_order IN (1, 2, 3)) -- 1: pretask, 2: duringtask, 3: posttask
);

-- CREATING TABLE links (pre-task)
CREATE TABLE link (
    id_link SERIAL NOT NULL,
    id_task SMALLINT NOT NULL,
    link_order SMALLINT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_link PRIMARY KEY (id_link),
    CONSTRAINT fk_link_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT uk_link_constr UNIQUE (id_task, link_order)
);

-- CREATING TABLE preguntas
CREATE TABLE question (
    id_question SERIAL NOT NULL,
    id_task_stage SMALLINT NOT NULL,
    question_order SMALLINT NOT NULL,
    content VARCHAR(100) NOT NULL,
    audio_url VARCHAR(2048),
    video_url VARCHAR(2048),
    type VARCHAR(50) NOT NULL,
    img_alt VARCHAR(50),
    img_url VARCHAR(2048),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_question PRIMARY KEY (id_question),
    CONSTRAINT fk_question_task FOREIGN KEY (id_task_stage) REFERENCES task_stage(id_task_stage),
    CONSTRAINT uk_question_constr UNIQUE (id_task_stage, question_order),
    CONSTRAINT check_question_type CHECK (type IN ('select', 'audio'))
);

-- CREATING TABLE respuestas
CREATE TABLE option (
    id_option SERIAL NOT NULL,
    id_question INTEGER NOT NULL,
    content VARCHAR(1000) NOT NULL,
    feedback VARCHAR(100),
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
    session BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_course PRIMARY KEY (id_course),
    CONSTRAINT fk_course_teacher FOREIGN KEY (id_teacher) REFERENCES teacher(id_teacher),
    CONSTRAINT fk_course_institution FOREIGN KEY (id_institution) REFERENCES institution(id_institution)
);

-- CREATING TABLE Grupos
CREATE TABLE team (
    id_team SERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    code CHAR(6),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    -- CONSTRAINTS
    CONSTRAINT pk_team PRIMARY KEY (id_team)
);

-- CREATING TABLE Estudiantes
CREATE TABLE student (
    id_student SERIAL NOT NULL,
    id_course SMALLINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(50) NOT NULL,
    blindness VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_student PRIMARY KEY (id_student),
    CONSTRAINT fk_student_course FOREIGN KEY (id_course) REFERENCES course(id_course),
    CONSTRAINT uk_student_email UNIQUE (email),
    CONSTRAINT uk_student_username UNIQUE (username),
    CONSTRAINT check_student_blindness CHECK (blindness IN ('total', 'partial', 'none'))
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
    id_student INTEGER NOT NULL,
    power VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    time_stamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- CONSTRAINTS
    CONSTRAINT pk_task_attempt PRIMARY KEY (id_task_attempt),
    CONSTRAINT fk_task_attempt_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT fk_task_attempt_team FOREIGN KEY (id_team) REFERENCES team(id_team),
    CONSTRAINT fk_task_attempt_student FOREIGN KEY (id_student) REFERENCES student(id_student),
    CONSTRAINT check_task_attempt_power CHECK (power IN ('super_hearing', 'memory_pro', 'super_radar'))
);

-- CREATING TABLE
CREATE TABLE answer (
    id_answer SERIAL NOT NULL,
    id_question INTEGER NOT NULL,
    id_option INTEGER,
    id_task_attempt INTEGER NOT NULL,
    id_team INTEGER NOT NULL,
    answer_seconds INTEGER NOT NULL,
    audio1_url VARCHAR(2048),
    audio2_url VARCHAR(2048),
    -- CONSTRAINTS
    CONSTRAINT pk_answer PRIMARY KEY (id_answer),
    CONSTRAINT fk_answer_question FOREIGN KEY (id_question) REFERENCES question(id_question),
    CONSTRAINT fk_answer_option FOREIGN KEY (id_option) REFERENCES option(id_option),
    CONSTRAINT fk_answer_task_attempt FOREIGN KEY (id_task_attempt) REFERENCES task_attempt(id_task_attempt),
    CONSTRAINT fk_answer_team FOREIGN KEY (id_team) REFERENCES team(id_team)
);

-- TODO: create table Animal
-- TODO: create table Historial

-- FUNCTIONS
-- INSERT INTO student_task when a new student is inserted
CREATE OR REPLACE FUNCTION insert_student_task_for_new_student()
RETURNS TRIGGER AS $$
DECLARE
    new_student_id INTEGER;
    task_id SMALLINT; -- to iterate over the tasks
BEGIN
    -- Get the ID of the newly inserted student
    new_student_id = (SELECT id_student FROM student ORDER BY id_student DESC LIMIT 1);
    -- Insert a record into the student_task table for each task
    FOR task_id IN (SELECT id_task FROM task) LOOP
        RAISE NOTICE 'Inserting student_task for student % and task %', new_student_id, task_id;
        INSERT INTO student_task (id_student, id_task)
        VALUES (new_student_id, task_id);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- INSERT INTO student_task when a new task is inserted
CREATE OR REPLACE FUNCTION insert_student_task_for_new_task()
RETURNS TRIGGER AS $$
DECLARE
    new_task_id SMALLINT;
    student_id INTEGER; -- to iterate over the students
BEGIN
    -- Get the ID of the newly inserted task
    new_task_id = (SELECT id_task FROM task ORDER BY id_task DESC LIMIT 1);
    -- Insert a record into the student_task table for each student
    FOR student_id IN (SELECT id_student FROM student) LOOP
        RAISE NOTICE 'Inserting student_task for student % and task %', student_id, new_task_id;
        INSERT INTO student_task (id_student, id_task)
        VALUES (student_id, new_task_id);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- INSERT INTO task_stage when a new task is inserted (3 stages per task)
CREATE OR REPLACE FUNCTION insert_task_stage_for_new_task()
RETURNS TRIGGER AS $$
DECLARE
    new_task_id INTEGER;
BEGIN
    -- Get the ID of the newly inserted task
    new_task_id = (SELECT id_task FROM task ORDER BY id_task DESC LIMIT 1);
    -- Insert 3 records into the task_stage table
    -- Stage 1
    INSERT INTO task_stage (id_task, task_stage_order, description)
    VALUES (new_task_id, 1, 'Description for Stage 1');
    -- Stage 2
    INSERT INTO task_stage (id_task, task_stage_order, description)
    VALUES (new_task_id, 2, 'Description for Stage 2');
    -- Stage 3
    INSERT INTO task_stage (id_task, task_stage_order, description)
    VALUES (new_task_id, 3, 'Description for Stage 3');
    RAISE NOTICE 'Inserted 3 task_stage records for task %', new_task_id;
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

-- Trigger to insert records into the task_stage table for each new task
CREATE TRIGGER insert_task_stage_for_new_task_trigger
AFTER INSERT ON task
FOR EACH ROW
EXECUTE FUNCTION insert_task_stage_for_new_task();

-- INSERTING DATA
-- INSERT INTO task
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (1, 'Task 1', 'Description for Task 1', 'Long description for Task 1', '{ "Keyword 1", "Keyword 2", "Keyword 3" }', 'https://picsum.photos/300/200');
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (2, 'Task 2', 'Description for Task 2', 'Long description for Task 2', '{ "Keyword 1", "Keyword 2", "Keyword 3" }', 'https://picsum.photos/300/200');
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (3, 'Task 3', 'Description for Task 3', 'Long description for Task 3', '{ "Keyword 1", "Keyword 2", "Keyword 3" }', 'https://picsum.photos/300/200');
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (4, 'Task 4', 'Description for Task 4', 'Long description for Task 4', '{ "Keyword 1", "Keyword 2", "Keyword 3" }', 'https://picsum.photos/300/200');
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (5, 'Task 5', 'Description for Task 5', 'Long description for Task 5', '{ "Keyword 1", "Keyword 2", "Keyword 3" }', 'https://picsum.photos/300/200');

-- INSERT INTO link
INSERT INTO link (id_task, link_order, topic, url) VALUES (1, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113/task-1-vocabulary');
INSERT INTO link (id_task, link_order, topic, url) VALUES (1, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36054813/task-1-prepositions-of-place-meaning');
INSERT INTO link (id_task, link_order, topic, url) VALUES (1, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36022540/task-1-prepositions-of-place-questions');
INSERT INTO link (id_task, link_order, topic, url) VALUES (2, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113/task-1-vocabulary');
INSERT INTO link (id_task, link_order, topic, url) VALUES (2, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36054813/task-1-prepositions-of-place-meaning');
INSERT INTO link (id_task, link_order, topic, url) VALUES (2, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36022540/task-1-prepositions-of-place-questions');
INSERT INTO link (id_task, link_order, topic, url) VALUES (3, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113/task-1-vocabulary');
INSERT INTO link (id_task, link_order, topic, url) VALUES (3, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36054813/task-1-prepositions-of-place-meaning');
INSERT INTO link (id_task, link_order, topic, url) VALUES (3, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36022540/task-1-prepositions-of-place-questions');
INSERT INTO link (id_task, link_order, topic, url) VALUES (4, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113/task-1-vocabulary');
INSERT INTO link (id_task, link_order, topic, url) VALUES (4, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36054813/task-1-prepositions-of-place-meaning');
INSERT INTO link (id_task, link_order, topic, url) VALUES (4, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36022540/task-1-prepositions-of-place-questions');
INSERT INTO link (id_task, link_order, topic, url) VALUES (5, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113/task-1-vocabulary');
INSERT INTO link (id_task, link_order, topic, url) VALUES (5, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36054813/task-1-prepositions-of-place-meaning');
INSERT INTO link (id_task, link_order, topic, url) VALUES (5, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36022540/task-1-prepositions-of-place-questions');

-- INSERT INTO question
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (1, 1, 'What''s your name?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 1, 'How old are you?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (3, 1, 'Where are you from?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (4, 1, 'Do you like coffee?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 1, 'How are you today?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (6, 1, 'What do you do for a living?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (7, 1, 'Do you have any pets?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 1, 'What''s your favorite color?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (9, 1, 'Do you like to travel?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (10, 1, 'What''s your favorite food?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 1, 'Do you have any hobbies?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (12, 1, 'What time is it now?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (13, 1, 'How many siblings do you have?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 1, 'What''s the weather like today?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (15, 1, 'Do you speak any other languages besides English?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');

-- INSERT INTO option
INSERT INTO option (id_question, content, feedback, correct) VALUES (1, 'My name is ChatGPT.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (1, 'My name is not ChatGPT.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (2, 'I am a few months old.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (2, 'I am a few decades old.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (3, 'I was developed by OpenAI, so you could say I am from OpenAI.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (3, 'I am from Mars.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (4, 'As an AI language model, I do not have personal preferences or physical abilities to consume anything, so I do not have an opinion on coffee.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (4, 'I love coffee.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (5, 'I am a machine learning model and do not have feelings, but I am functioning normally.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (5, 'I am feeling sad today.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'I am an AI language model developed by OpenAI and I assist users in generating text based on the input provided to me.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'I am a doctor.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'As an AI language model, I do not have physical abilities or personal possessions, so I do not have pets.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'I have a dog.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (8, 'As an AI language model, I do not have personal preferences, so I do not have a favorite color.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (8, 'My favorite color is blue.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (9, 'As an AI language model, I do not have personal preferences or physical abilities, so I do not have an opinion on traveling.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (9, 'I love to travel.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (10, 'As an AI language model, I do not have personal preferences or physical abilities to consume anything, so I do not have a favorite food.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (10, 'My favorite food is pizza.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (11, 'As an AI language model, I do not have personal preferences or physical abilities, so I do not have hobbies.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (11, 'My hobby is playing video games.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (12, 'I am an AI language model and do not have access to real-time information.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (12, 'It is currently 2 PM.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (13, 'As an AI language model, I do not have siblings.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (13, 'I have 3 siblings.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'I am an AI language model and do not have access to real-time information.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'The weather today is sunny and warm.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'Yes, I have been trained on a diverse range of languages and can respond in multiple languages including English.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'No, I only speak English.', 'Incorrect!', FALSE);

-- *INSERTANDO USUARIOS E INSTITUCIONES DE PRUEBA
-- INSERT INTO institution
INSERT INTO institution (id_institution, name, nit, address, city, country, phone, email) VALUES (1, 'Institución de prueba', '123456789', 'Cra 45 # 23-67', 'Barranquilla', 'Colombia', '1234567', 'prueba@test.com');

-- INSERT INTO teacher
INSERT INTO teacher (id_teacher, id_institution, first_name, last_name, email, username, password) VALUES (1, 1, 'Profesor', 'Prueba', 'teacher@test.com', 'teacher', 'teacher');

-- INSERT INTO course
INSERT INTO course (id_course, id_institution, id_teacher, name, description) VALUES (1, 1, 1, 'Curso de prueba', 'Curso de prueba para la aplicación');

-- INSERT INTO student
INSERT INTO student (id_student, id_course, first_name, last_name, email, username, blindness, password) VALUES (1, 1, 'Estudiante', 'Prueba', 'student@test.com', 'student', 'none', 'pass123');
INSERT INTO student (id_student, id_course, first_name, last_name, email, username, blindness, password) VALUES (2, 1, 'Estudiante', 'Prueba', 'student2@test.com', 'student2', 'none', 'pass123');

-- INSERT INTO admin
INSERT INTO admin (id_admin, first_name, last_name, email, username, password) VALUES (1, 'Administrador', 'Prueba', 'admin@test.com', 'admin', 'pass123');
