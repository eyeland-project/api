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

CREATE TABLE blindness_acuity (
    id_blindness_acuity SMALLSERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    level SMALLINT NOT NULL,
    description VARCHAR(1000) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_blindness_acuity PRIMARY KEY (id_blindness_acuity),
    CONSTRAINT uk_blindness_acuity_name UNIQUE (name)
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
    id_course SMALLINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    code CHAR(6),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    -- CONSTRAINTS
    CONSTRAINT pk_team PRIMARY KEY (id_team),
    CONSTRAINT fk_team_course FOREIGN KEY (id_course) REFERENCES course(id_course)
);
CREATE UNIQUE INDEX idx_team_active_code ON team (code) WHERE active; -- code is unique only if the team is active

-- CREATING TABLE Estudiantes
CREATE TABLE student (
    id_student SERIAL NOT NULL,
    id_course SMALLINT NOT NULL,
    id_blindness_acuity SMALLINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_student PRIMARY KEY (id_student),
    CONSTRAINT fk_student_course FOREIGN KEY (id_course) REFERENCES course(id_course),
    CONSTRAINT fk_student_blindness_acuity FOREIGN KEY (id_blindness_acuity) REFERENCES blindness_acuity(id_blindness_acuity),
    CONSTRAINT uk_student_email UNIQUE (email),
    CONSTRAINT uk_student_username UNIQUE (username)
);

CREATE TABLE student_task (
    id_student_task SERIAL NOT NULL,
    id_student INTEGER NOT NULL,
    id_task SMALLINT NOT NULL,
    highest_stage SMALLINT NOT NULL DEFAULT 0, -- 0: not started, 1: pretask, 2: duringtask, 3: postask
    -- CONSTRAINTS
    CONSTRAINT pk_student_task PRIMARY KEY (id_student_task),
    CONSTRAINT fk_student_task_student FOREIGN KEY (id_student) REFERENCES student(id_student),
    CONSTRAINT fk_student_task_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT uk_student_task UNIQUE (id_student, id_task),
    CONSTRAINT check_student_task_highest_stage CHECK (highest_stage >= 0 AND highest_stage <= 3)
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
CREATE UNIQUE INDEX idx_task_attempt_active_id_student ON task_attempt (id_student) WHERE active; -- id_student is unique only if the task_attempt is active

-- CREATING TABLE
CREATE TABLE answer (
    id_answer SERIAL NOT NULL,
    id_question INTEGER NOT NULL,
    id_option INTEGER,
    id_task_attempt INTEGER NOT NULL,
    id_team INTEGER,
    answer_seconds INTEGER NOT NULL,
    audio_url VARCHAR(2048),
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

-- INSERT INTO blindness_acuity
INSERT INTO blindness_acuity (name, level, description) VALUES ('None', 0, 'Equal to or better than: 6/12 | 5/10 (0.5) | 20/40 | 0.3');
INSERT INTO blindness_acuity (name, level, description) VALUES ('Mild', 1, 'Worse than: 6/12 | 5/10 (0.5) | 20/40 | 0.3; Equal to or better than: 6/18 | 3/10 (0.3) | 20/70 | 0.5');
INSERT INTO blindness_acuity (name, level, description) VALUES ('Moderate', 2, 'Worse than: 6/18 | 3/10 (0.3) | 20/70 | 0.5; Equal to or better than: 6/60 | 1/10 (0.1) | 20/200 | 1.0');
INSERT INTO blindness_acuity (name, level, description) VALUES ('Severe', 3, 'Worse than: 6/60 | 1/10 (0.1) | 20/200 | 1.0; Equal to or better than: 3/60 | 1/20 (0.05) | 20/400 | 1.3');
INSERT INTO blindness_acuity (name, level, description) VALUES ('Blindness (category 4)', 4, 'Worse than: 3/60 | 1/20 (0.05) | 20/400 | 1.3; Equal to or better than: 1/60 | 1/50 (0.02) | 20/1200 | 1.8');
INSERT INTO blindness_acuity (name, level, description) VALUES ('Blindness (category 5)', 5, 'Worse than: 1/60 | 1/50 (0.02) | 5/300 (20/1200) | 1.8; Equal to or better than: light perception');
INSERT INTO blindness_acuity (name, level, description) VALUES ('Blindness (category 6)', 6, 'Worse than: no light perception');

-- INSERT INTO link
INSERT INTO link (id_task, link_order, topic, url) VALUES (1, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113');
INSERT INTO link (id_task, link_order, topic, url) VALUES (1, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36022540');
INSERT INTO link (id_task, link_order, topic, url) VALUES (1, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36054813');
INSERT INTO link (id_task, link_order, topic, url) VALUES (2, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113');
INSERT INTO link (id_task, link_order, topic, url) VALUES (2, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36022540');
INSERT INTO link (id_task, link_order, topic, url) VALUES (2, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36054813');
INSERT INTO link (id_task, link_order, topic, url) VALUES (3, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113');
INSERT INTO link (id_task, link_order, topic, url) VALUES (3, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36022540');
INSERT INTO link (id_task, link_order, topic, url) VALUES (3, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36054813');
INSERT INTO link (id_task, link_order, topic, url) VALUES (4, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113');
INSERT INTO link (id_task, link_order, topic, url) VALUES (4, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36022540');
INSERT INTO link (id_task, link_order, topic, url) VALUES (4, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36054813');
INSERT INTO link (id_task, link_order, topic, url) VALUES (5, 1, 'Vocabulary', 'https://wordwall.net/resource/36022113');
INSERT INTO link (id_task, link_order, topic, url) VALUES (5, 2, 'Prepositions of place meaning', 'https://wordwall.net/resource/36022540');
INSERT INTO link (id_task, link_order, topic, url) VALUES (5, 3, 'Prepositions of place questions', 'https://wordwall.net/resource/36054813');

-- INSERT INTO question
-- square brackets: prepositions; curly braces: nouns
-- task 1
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (1, 1, 'What''s your name?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (1, 2, 'How old are you?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (1, 3, 'Where are you from?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (3, 1, 'What was your favorite part of the activity?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (3, 2, 'Did you learn any new information about Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
-- task 2
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (4, 1, 'What''s your name?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (4, 2, 'How old are you?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (4, 3, 'Where are you from?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (6, 1, 'What was your favorite part of the activity?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (6, 2, 'Did you learn any new information about Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
-- task 3
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (7, 1, 'What''s your name?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (7, 2, 'How old are you?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (7, 3, 'Where are you from?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (9, 1, 'What was your favorite part of the activity?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (9, 2, 'Did you learn any new information about Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
-- task 4
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (10, 1, 'What''s your name?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (10, 2, 'How old are you?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (10, 3, 'Where are you from?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (12, 1, 'What was your favorite part of the activity?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (12, 2, 'Did you learn any new information about Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
-- task 5
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (13, 1, 'What''s your name?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (13, 2, 'How old are you?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (13, 3, 'Where are you from?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (15, 1, 'What was your favorite part of the activity?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (15, 2, 'Did you learn any new information about Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://picsum.photos/300/200');

-- INSERT INTO option
-- task 1
INSERT INTO option (id_question, content, feedback, correct) VALUES (1, 'My name is Walter Hartwell White.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (1, 'I don''t know.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (2, 'I am 52 years old.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (2, 'I don''t remember.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (3, 'I live at 308 Negra Arroyo Lane Albuquerque New Mexico', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (3, 'I am from Mars.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (4, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (4, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (4, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (4, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (4, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (4, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (5, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (5, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (5, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (5, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (5, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (5, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Palermo town is [near] the {road}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Tasajera town is [behind] the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Palermo town is [on] the {bridge}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Tasajera town is [under] the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Palermo town is [near] Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Tasajera town isn''t [near] Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is [between] the {hotel} and Terranova {farm}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is [between] the {beach} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is [between] the {toll} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is [between] the {bridge} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is [between] the {beach} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is [between] the {hotel} and the {beach}', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (8, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (8, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (8, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (8, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (8, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (8, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (9, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (9, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (9, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (9, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (9, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (9, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (10, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (10, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (10, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (10, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (10, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (10, 'No, there is', 'Incorrect!', FALSE);

-- task 2
INSERT INTO option (id_question, content, feedback, correct) VALUES (11, 'My name is Walter Hartwell White.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (11, 'I don''t know.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (12, 'I am 52 years old.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (12, 'I don''t remember.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (13, 'I live at 308 Negra Arroyo Lane Albuquerque New Mexico', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (13, 'I am from Mars.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Palermo town is [near] the {road}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Tasajera town is [behind] the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Palermo town is [on] the {bridge}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Tasajera town is [under] the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Palermo town is [near] Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Tasajera town isn''t [near] Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'It is [between] the {hotel} and Terranova {farm}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'It is [between] the {beach} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'It is [between] the {toll} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'It is [between] the {bridge} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'It is [between] the {beach} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'It is [between] the {hotel} and the {beach}', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'No, there is', 'Incorrect!', FALSE);

-- task 3
INSERT INTO option (id_question, content, feedback, correct) VALUES (21, 'My name is Walter Hartwell White.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (21, 'I don''t know.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (22, 'I am 52 years old.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (22, 'I don''t remember.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (23, 'I live at 308 Negra Arroyo Lane Albuquerque New Mexico', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (23, 'I am from Mars.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (24, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (24, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (24, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (24, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (24, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (24, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Palermo town is [near] the {road}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Tasajera town is [behind] the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Palermo town is [on] the {bridge}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Tasajera town is [under] the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Palermo town is [near] Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Tasajera town isn''t [near] Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'It is [between] the {hotel} and Terranova {farm}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'It is [between] the {beach} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'It is [between] the {toll} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'It is [between] the {bridge} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'It is [between] the {beach} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'It is [between] the {hotel} and the {beach}', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'No, there is', 'Incorrect!', FALSE);

-- task 4
INSERT INTO option (id_question, content, feedback, correct) VALUES (31, 'My name is Walter Hartwell White.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (31, 'I don''t know.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (32, 'I am 52 years old.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (32, 'I don''t remember.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (33, 'I live at 308 Negra Arroyo Lane Albuquerque New Mexico', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (33, 'I am from Mars.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (35, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (35, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (35, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (35, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (35, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (35, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (36, 'Palermo town is [near] the {road}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (36, 'Tasajera town is [behind] the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (36, 'Palermo town is [on] the {bridge}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (36, 'Tasajera town is [under] the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (36, 'Palermo town is [near] Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (36, 'Tasajera town isn''t [near] Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'It is [between] the {hotel} and Terranova {farm}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'It is [between] the {beach} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'It is [between] the {toll} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'It is [between] the {bridge} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'It is [between] the {beach} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'It is [between] the {hotel} and the {beach}', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'No, there is', 'Incorrect!', FALSE);

-- task 5
INSERT INTO option (id_question, content, feedback, correct) VALUES (41, 'My name is Walter Hartwell White.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (41, 'I don''t know.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (42, 'I am 52 years old.', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (42, 'I don''t remember.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (43, 'I live at 308 Negra Arroyo Lane Albuquerque New Mexico', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (43, 'I am from Mars.', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Palermo town is [near] the {road}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Tasajera town is [behind] the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Palermo town is [on] the {bridge}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Tasajera town is [under] the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Palermo town is [near] Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Tasajera town isn''t [near] Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (47, 'It is [between] the {hotel} and Terranova {farm}', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (47, 'It is [between] the {beach} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (47, 'It is [between] the {toll} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (47, 'It is [between] the {bridge} and the {river}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (47, 'It is [between] the {beach} and the {road}', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (47, 'It is [between] the {hotel} and the {beach}', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (48, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (48, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (48, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (48, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (48, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (48, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'No, there is', 'Incorrect!', FALSE);

-- *INSERTANDO USUARIOS E INSTITUCIONES DE PRUEBA
-- INSERT INTO institution
INSERT INTO institution (id_institution, name, nit, address, city, country, phone, email) VALUES (1, 'Institución de prueba', '123456789', 'Cra 45 # 23-67', 'Barranquilla', 'Colombia', '1234567', 'prueba@test.com');

-- INSERT INTO teacher
INSERT INTO teacher (id_teacher, id_institution, first_name, last_name, email, username, password) VALUES (1, 1, 'Profesor', 'Prueba', 'teacher@test.com', 'teacher', 'teacher');

-- INSERT INTO course
INSERT INTO course (id_course, id_institution, id_teacher, name, description, session) VALUES (1, 1, 1, 'Curso de prueba', 'Curso de prueba para la aplicación', TRUE);

-- INSERT INTO student
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 1, 'Estudiante1', 'Prueba', 'student1@test.com', 'student1', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 2, 'Estudiante2', 'Prueba', 'student2@test.com', 'student2', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 3, 'Estudiante3', 'Prueba', 'student3@test.com', 'student3', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 4, 'Estudiante4', 'Prueba', 'student4@test.com', 'student4', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 5, 'Estudiante5', 'Prueba', 'student5@test.com', 'student5', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 6, 'Estudiante6', 'Prueba', 'student6@test.com', 'student6', 'pass123');


-- INSERT INTO team
INSERT INTO team (id_course, name, code) VALUES (1, 'Equipo 1', '123456');
INSERT INTO team (id_course, name, code) VALUES (1, 'Equipo 2', '234567');
INSERT INTO team (id_course, name, code) VALUES (1, 'Equipo 3', '345678');

-- INSERT INTO admin
INSERT INTO admin (id_admin, first_name, last_name, email, username, password) VALUES (1, 'Administrador', 'Prueba', 'admin@test.com', 'admin', 'pass123');
