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
    description VARCHAR(200) NOT NULL,
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
    content VARCHAR(200) NOT NULL,
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

CREATE TYPE valid_power AS ENUM ('super_hearing', 'memory_pro', 'super_radar');

-- CREATING TABLE
CREATE TABLE task_attempt (
    id_task_attempt SERIAL NOT NULL,
    id_task SMALLINT NOT NULL,
    id_team INTEGER,
    id_student INTEGER NOT NULL,
    power VALID_POWER,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    time_stamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- CONSTRAINTS
    CONSTRAINT pk_task_attempt PRIMARY KEY (id_task_attempt),
    CONSTRAINT fk_task_attempt_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT fk_task_attempt_team FOREIGN KEY (id_team) REFERENCES team(id_team),
    CONSTRAINT fk_task_attempt_student FOREIGN KEY (id_student) REFERENCES student(id_student)
    -- CONSTRAINT check_task_attempt_power_not_null CHECK (id_team IS NULL OR power IS NOT NULL)
);
CREATE UNIQUE INDEX idx_task_attempt_active_id_student ON task_attempt (id_student) WHERE active; -- id_student is unique if the task_attempt is active
-- CREATE UNIQUE INDEX idx_task_attempt_active_power_id_team ON task_attempt (power, id_team) WHERE active; -- power and id_team are unique if the task_attempt is active

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
    CONSTRAINT fk_answer_team FOREIGN KEY (id_team) REFERENCES team(id_team),
    CONSTRAINT uk_answer UNIQUE (id_task_attempt, id_question, id_option) -- a student can only answer a question once per task_attempt
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

-- Throw exception if all team members don't doing the same task
CREATE OR REPLACE FUNCTION check_team_tasks() RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM task_attempt t1
    WHERE t1.id_team = NEW.id_team AND t1.id_task <> NEW.id_task AND t1.active
  ) THEN
    RAISE EXCEPTION 'Team members must be doing the same task';
  END IF;
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

-- Trigger to check that all team members are doing the same task
CREATE TRIGGER check_team_tasks_trigger
BEFORE INSERT OR UPDATE ON task_attempt
FOR EACH ROW
EXECUTE FUNCTION check_team_tasks();

-- INSERTING DATA
-- INSERT INTO task
-- <a href="https://www.freepik.es/foto-gratis/puente-cable-murom-traves-oka_1469557.htm#page=2&query=bridge&position=0&from_view=search&track=sph">Imagen de bearfotos</a> en Freepik
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (1, 'Journey to the Mangroves', 'Join a virtual journey to Parque Isla Salamanca, while learning basic English phrases related to travel and nature.', 'Get ready for a fun journey from Barranquilla to Parque Isla Salamanca! We''ll cross a big bridge and the sea, while learning how to say hello, goodbye, and thank you in English. You''ll also learn new words and phrases related to travel and nature, like "boat", "beach", "mountain", and "tree". Are you excited?', '{ "travel", "nature", "vocabulary", "phrases", "basic English", "bridge", "sea" }', 'https://img.freepik.com/foto-gratis/puente-cable-murom-traves-oka_1398-3511.jpg');
-- <a href="https://www.freepik.es/foto-gratis/ancho-rio-cerca-rio-negro-jamaica-paisaje-exotico-manglares_14875432.htm#query=mangrove%20swamp&position=33&from_view=search&track=ais">Imagen de mb-photoarts</a> en Freepik
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (2, 'Meet the Animals', 'Explore the wildlife of the mangroves, learning animal names, habits, and habitats.', 'Let''s explore the amazing wildlife of the mangroves! We''ll meet different animals, like birds, crabs, and reptiles, and learn how to say their names and where they live. We''ll also learn some cool facts about their habits and how they survive in the mangroves. Get ready to have fun and learn new things!', '{ "wildlife", "animals", "names", "habits", "habitats", "birds", "crabs", "reptiles" }', 'https://img.freepik.com/foto-gratis/ancho-rio-cerca-rio-negro-jamaica-paisaje-exotico-manglares_333098-202.jpg');
-- Foto de Tom Fisk: https://www.pexels.com/es-es/foto/arboles-verdes-2666806/
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (3, 'Eco Adventures', 'Go on eco-friendly adventures, like hiking, kayaking, and fishing, while practicing English phrases related to outdoor activities and environmental awareness.', 'It''s time for some eco-friendly adventures in the mangroves! We''ll go hiking, kayaking, and fishing, while learning new English phrases related to outdoor activities, like "let''s go!", "I''m having fun", and "this is beautiful". We''ll also learn how to take care of the environment and why it''s important to protect the mangroves. Are you up for the challenge?', '{ "eco-friendly", "adventures", "hiking", "kayaking", "fishing", "phrases", "outdoor activities", "environmental awareness" }', 'https://images.pexels.com/photos/2666806/pexels-photo-2666806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
-- Foto de icon0.com: https://www.pexels.com/es-es/foto/madera-paisaje-naturaleza-verano-726298/
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (4, 'Local Culture', 'Discover the local culture and traditions of the communities surrounding Parque Isla Salamanca, learning about food, music, dance, and crafts.', 'Let''s discover the local culture and traditions of the communities surrounding Parque Isla Salamanca! We''ll learn how to say hello and how are you in English, and we''ll also learn about the delicious food, fun music, colorful dance, and beautiful crafts that make this place special. You''ll even get to practice some English expressions and have a virtual chat with a local friend!', '{ "local culture", "traditions", "food", "music", "dance", "crafts", "greetings", "expressions", "social interaction" }', 'https://images.pexels.com/photos/726298/pexels-photo-726298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
-- Foto de Marcel Kodama: https://www.pexels.com/es-es/foto/bosque-de-bambu-con-hilera-de-arboles-en-un-dia-soleado-3632689/
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url) VALUES (5, 'The Great Challenge', 'Use all your English skills to solve a mystery or complete a puzzle related to the mangroves, consolidating your learning and having fun.', 'Are you ready for the ultimate challenge? In this final task, you''ll have to use all your English skills to solve a mystery or complete a puzzle related to the history, geography, and ecology of the mangroves. You''ll have fun and learn at the same time, while consolidating all the knowledge you''ve gained during the previous tasks. Do you have what it takes to be a great English learner?', '{ "English skills", "mystery", "puzzle", "mangroves", "learning", "fun" }', 'https://images.pexels.com/photos/3632689/pexels-photo-3632689.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');

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
-- questions from task 1
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (1, 1, 'How do you greet someone?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (1, 2, 'Which one is about nature?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (1, 3, 'What can you find in Isla Salamanca?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (2, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (3, 1, 'What was a part of the road?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (3, 2, 'How do you thank someone?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
-- questions from task 2
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (4, 1, 'Which of the following animals lives in the mangroves?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (4, 2, 'Which of the following animals is a reptile?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (4, 3, 'Which of the following animals can fly?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 1, 'What is the name of the bird that is often found in the mangroves?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 2, 'Which of the following animals has a hard shell for protection?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 3, 'What is the name of the snake that is commonly found in the mangroves?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 4, 'Which of the following animals is a herbivore?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 5, 'Which of the following animals is NOT commonly found in the mangroves?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 6, 'What is the name of the animal that can change its skin color?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (5, 7, 'Which of the following birds is known for its long, curved beak?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (6, 1, 'Which of the following animals did you learn about?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (6, 2, 'Which of the following words did you learn about the ecosystem?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/mangrove,animals');
-- questions from task 3
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (7, 1, 'How do you greet someone?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (7, 2, 'Which one is about nature?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (7, 3, 'What can you find in Isla Salamanca?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (8, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (9, 1, 'What was a part of the road?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (9, 2, 'How do you thank someone?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
-- questions from task 4
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (10, 1, 'How do you greet someone?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (10, 2, 'Which one is about nature?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (10, 3, 'What can you find in Isla Salamanca?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (11, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (12, 1, 'What was a part of the road?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (12, 2, 'How do you thank someone?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
-- questions from task 5
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (13, 1, 'How do you greet someone?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (13, 2, 'Which one is about nature?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (13, 3, 'What can you find in Isla Salamanca?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 1, 'Are you [on] the {bridge}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 2, 'Is there a {river} [under] the bridge?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 3, 'Look at the {road}. Is there a {town} [near] it?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 4, 'Where is Laureano Gomez {toll}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 5, 'Is Playa Linda {beach} [far from] Barranquilla?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 6, 'Are there {swamps} [near] the {beach}?', NULL, NULL, 'select', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (14, 7, 'Is there a {farm} [next to] Salamanca Island?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (15, 1, 'What was a part of the road?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');
INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url) VALUES (15, 2, 'How do you thank someone?', NULL, NULL, 'audio', NULL, 'https://loremflickr.com/320/240/bridge');

-- INSERT INTO option
-- options for task 1
INSERT INTO option (id_question, content, feedback, correct) VALUES (1, 'Hello', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (1, 'Good morning', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (1, 'Goodbye', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (2, 'Mangrove', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (2, 'Hotel', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (2, 'Car', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (3, 'Lakes', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (3, 'Beaches', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (3, 'Mountains', 'Incorrect!', FALSE);

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

INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Palermo town is near the road', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Tasajera town is behind the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Palermo town is on the bridge', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Tasajera town is under the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Palermo town is near Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (6, 'Tasajera town isn''t near Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is between the hotel and Terranova farm', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is between the beach and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is between the toll and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is between the bridge and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is between the beach and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (7, 'It is between the hotel and the beach', 'Incorrect!', FALSE);

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

INSERT INTO option (id_question, content, feedback, correct) VALUES (11, 'The bridge', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (11, 'The tunnel', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (12, 'Thank you', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (12, 'Goodbye', 'Incorrect!', FALSE);

-- options for task 2
INSERT INTO option (id_question, content, feedback, correct) VALUES (13, 'Hello', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (13, 'Good morning', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (13, 'Goodbye', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'Mangrove', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'Hotel', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (14, 'Car', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'Lakes', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'Beaches', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (15, 'Mountains', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (16, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (17, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Palermo town is near the road', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Tasajera town is behind the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Palermo town is on the bridge', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Tasajera town is under the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Palermo town is near Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (18, 'Tasajera town isn''t near Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'It is between the hotel and Terranova farm', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'It is between the beach and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'It is between the toll and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'It is between the bridge and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'It is between the beach and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (19, 'It is between the hotel and the beach', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (20, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (21, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (21, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (21, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (21, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (21, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (21, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (22, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (22, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (22, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (22, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (22, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (22, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (23, 'The bridge', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (23, 'The tunnel', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (24, 'Thank you', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (24, 'Goodbye', 'Incorrect!', FALSE);

-- options for task 3
INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'Hello', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'Good morning', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (25, 'Goodbye', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Mangrove', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Hotel', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (26, 'Car', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'Lakes', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'Beaches', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (27, 'Mountains', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (28, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (29, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Palermo town is near the road', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Tasajera town is behind the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Palermo town is on the bridge', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Tasajera town is under the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Palermo town is near Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (30, 'Tasajera town isn''t near Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (31, 'It is between the hotel and Terranova farm', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (31, 'It is between the beach and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (31, 'It is between the toll and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (31, 'It is between the bridge and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (31, 'It is between the beach and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (31, 'It is between the hotel and the beach', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (32, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (32, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (32, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (32, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (32, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (32, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (33, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (33, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (33, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (33, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (33, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (33, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (34, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (35, 'The bridge', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (35, 'The tunnel', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (36, 'Thank you', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (36, 'Goodbye', 'Incorrect!', FALSE);

-- options for task 4
INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'Hello', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'Good morning', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (37, 'Goodbye', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'Mangrove', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'Hotel', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (38, 'Car', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'Lakes', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'Beaches', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (39, 'Mountains', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (40, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (41, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (41, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (41, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (41, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (41, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (41, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (42, 'Palermo town is near the road', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (42, 'Tasajera town is behind the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (42, 'Palermo town is on the bridge', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (42, 'Tasajera town is under the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (42, 'Palermo town is near Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (42, 'Tasajera town isn''t near Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (43, 'It is between the hotel and Terranova farm', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (43, 'It is between the beach and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (43, 'It is between the toll and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (43, 'It is between the bridge and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (43, 'It is between the beach and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (43, 'It is between the hotel and the beach', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (44, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (45, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (46, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (47, 'The bridge', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (47, 'The tunnel', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (48, 'Thank you', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (48, 'Goodbye', 'Incorrect!', FALSE);

-- options for task 5
INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'Hello', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'Good morning', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (49, 'Goodbye', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'Mangrove', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'Hotel', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (50, 'Car', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (51, 'Lakes', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (51, 'Beaches', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (51, 'Mountains', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (52, 'Yes, we are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (52, 'No, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (52, 'Yes, we aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (52, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (52, 'No, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (52, 'Yes, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (53, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (53, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (53, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (53, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (53, 'Yes, we are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (53, 'No, she isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (54, 'Palermo town is near the road', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (54, 'Tasajera town is behind the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (54, 'Palermo town is on the bridge', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (54, 'Tasajera town is under the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (54, 'Palermo town is near Bogotá', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (54, 'Tasajera town isn''t near Palermo', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (55, 'It is between the hotel and Terranova farm', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (55, 'It is between the beach and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (55, 'It is between the toll and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (55, 'It is between the bridge and the river', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (55, 'It is between the beach and the road', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (55, 'It is between the hotel and the beach', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (56, 'Yes, it is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (56, 'No, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (56, 'Yes, it isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (56, 'No, it is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (56, 'Yes, he is', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (56, 'No, there isn''t', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (57, 'Yes, there are', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (57, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (57, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (57, 'Yes, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (57, 'No, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (57, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (58, 'Yes, there is', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (58, 'No, there isn''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (58, 'Yes, there are', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (58, 'No, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (58, 'Yes, there aren''t', 'Incorrect!', FALSE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (58, 'No, there is', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (59, 'The bridge', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (59, 'The tunnel', 'Incorrect!', FALSE);

INSERT INTO option (id_question, content, feedback, correct) VALUES (60, 'Thank you', 'Correct!', TRUE);
INSERT INTO option (id_question, content, feedback, correct) VALUES (60, 'Goodbye', 'Incorrect!', FALSE);

-- *INSERTANDO USUARIOS E INSTITUCIONES DE PRUEBA
-- INSERT INTO institution
INSERT INTO institution (id_institution, name, nit, address, city, country, phone, email) VALUES (1, 'Institución de prueba', '123456789', 'Cra 45 # 23-67', 'Barranquilla', 'Colombia', '1234567', 'prueba@test.com');

-- INSERT INTO teacher
INSERT INTO teacher (id_teacher, id_institution, first_name, last_name, email, username, password) VALUES (1, 1, 'Profesor', 'Prueba', 'teacher@test.com', 'teacher', 'teacher');

-- INSERT INTO course
INSERT INTO course (id_course, id_institution, id_teacher, name, description, session) VALUES (1, 1, 1, 'Curso de prueba', 'Curso de prueba para la aplicación', FALSE);

-- INSERT INTO student
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 1, 'Estudiante1', 'Prueba', 'student1@test.com', 'student1', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 2, 'Estudiante2', 'Prueba', 'student2@test.com', 'student2', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 3, 'Estudiante3', 'Prueba', 'student3@test.com', 'student3', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 4, 'Estudiante4', 'Prueba', 'student4@test.com', 'student4', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 5, 'Estudiante5', 'Prueba', 'student5@test.com', 'student5', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 6, 'Estudiante6', 'Prueba', 'student6@test.com', 'student6', 'pass123');
INSERT INTO student (id_course, id_blindness_acuity, first_name, last_name, email, username, password) VALUES (1, 7, 'Estudiante7', 'Prueba', 'student7@test.com', 'student7', 'pass123');

-- INSERT INTO team
INSERT INTO team (id_course, name, code) VALUES (1, 'Equipo 1', '111111');
INSERT INTO team (id_course, name, code) VALUES (1, 'Equipo 2', '222222');
INSERT INTO team (id_course, name, code) VALUES (1, 'Equipo 3', '333333');

-- INSERT INTO admin
INSERT INTO admin (id_admin, first_name, last_name, email, username, password) VALUES (1, 'Administrador', 'Prueba', 'admin@test.com', 'admin', 'pass123');
