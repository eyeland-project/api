-- THIS IS A POSTGRESQL INITIALIZATION FILE
-- TODO: check order of creation of tables to avoid errors
DROP DATABASE IF EXISTS mydb;
CREATE DATABASE mydb;
\connect mydb;

-- CREATING TABLES
-- CREATING TABLE blindness_acuity
CREATE TABLE blindness_acuity (
    id_blindness_acuity SMALLSERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    level SMALLINT NOT NULL,
    worse_than VARCHAR(200),
    better_eq_than VARCHAR(200),
    -- CONSTRAINTS
    CONSTRAINT pk_blindness_acuity PRIMARY KEY (id_blindness_acuity),
    CONSTRAINT uk_blindness_acuity_code UNIQUE (code)
);

-- CREATING TABLE color_deficiency
CREATE TABLE color_deficiency (
    id_color_deficiency SMALLSERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_color_deficiency PRIMARY KEY (id_color_deficiency),
    CONSTRAINT uk_color_deficiency_code UNIQUE (code)
);

-- CREATING TABLE visual_field_defect
CREATE TABLE visual_field_defect (
    id_visual_field_defect SMALLSERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_visual_field_defect PRIMARY KEY (id_visual_field_defect),
    CONSTRAINT uk_visual_field_defect_code UNIQUE (code)
);

-- CREATING TABLE task
CREATE TABLE task (
    id_task SMALLSERIAL NOT NULL,
    task_order SMALLINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    long_description VARCHAR(1000),
    keywords VARCHAR(50)[] NOT NULL DEFAULT '{}',
    thumbnail_url VARCHAR(2048),
    thumbnail_alt VARCHAR(50),
    coming_soon BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_task PRIMARY KEY (id_task),
    CONSTRAINT uk_task_task_order UNIQUE (task_order)
);

CREATE TYPE valid_task_stage_mechanic AS ENUM (
    'question_group-team_name',
    'question_group-duringtask_based',
    'hidden_question',
    'question_group-random',
    'form_image'
);

-- CREATING TABLE task_stage
CREATE TABLE task_stage (
    id_task_stage SMALLSERIAL NOT NULL,
    id_task SMALLINT NOT NULL,
    task_stage_order SMALLINT NOT NULL,
    description VARCHAR(100) NOT NULL,
    keywords VARCHAR(50)[] NOT NULL DEFAULT '{}',
    mechanics VALID_TASK_STAGE_MECHANIC[] NOT NULL DEFAULT '{}',
    -- CONSTRAINTS
    CONSTRAINT pk_task_stage PRIMARY KEY (id_task_stage),
    CONSTRAINT pk_task_stage_task FOREIGN KEY (id_task) REFERENCES task(id_task),
    CONSTRAINT uk_task_stage_constr UNIQUE (id_task, task_stage_order),
    CONSTRAINT check_task_stage_order CHECK (task_stage_order IN (1, 2, 3)) -- 1: pretask, 2: duringtask, 3: posttask
);

-- CREATING TABLE team_name
CREATE TABLE team_name (
    id_team_name SMALLSERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_team_name PRIMARY KEY (id_team_name),
    CONSTRAINT uk_team_name UNIQUE (name)
);

-- CREATING TABLE question_group
CREATE TABLE question_group (
    id_question_group SMALLSERIAL NOT NULL,
    id_team_name SMALLINT,
    -- CONSTRAINTS
    CONSTRAINT pk_question_group PRIMARY KEY (id_question_group),
    CONSTRAINT fk_question_group_team_name FOREIGN KEY (id_team_name) REFERENCES team_name(id_team_name)
);

CREATE TYPE valid_question_character AS ENUM (
    'beto',
    'valery',
    'alex',
    'chucho'
);
CREATE TYPE valid_question_type AS ENUM (
    'flashcard',
    'fill',
    'order',
    'select',
    'audio_select',
    'audio_order',
    'audio_speaking',
    'select_speaking',
    'select&speaking',
    'open',
    'order-word',
    'audio_order-word',
    'form_image'
);

CREATE TYPE valid_question_topic AS ENUM (
    'vocabulary',
    'prepositions',
    'personal_presentation'
);

CREATE TYPE valid_question_lang AS ENUM (
    'en',
    'es'
);

-- CREATING TABLE question
CREATE TABLE question (
    id_question SERIAL NOT NULL,
    id_question_group SMALLINT,
    id_task_stage SMALLINT NOT NULL,
    question_order SMALLINT NOT NULL,
    content VARCHAR(400) NOT NULL,
    audio_url VARCHAR(2048),
    video_url VARCHAR(2048),
    type VALID_QUESTION_TYPE NOT NULL,
    img_alt VARCHAR(200),
    img_url VARCHAR(2048),
    topic VALID_QUESTION_TOPIC,
    character VALID_QUESTION_CHARACTER,
    hint VARCHAR (200),
    lang VALID_QUESTION_LANG NOT NULL DEFAULT 'en',
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_question PRIMARY KEY (id_question),
    CONSTRAINT fk_question_task FOREIGN KEY (id_task_stage) REFERENCES task_stage(id_task_stage),
    CONSTRAINT fk_question_question_group FOREIGN KEY (id_question_group) REFERENCES question_group(id_question_group),
    CONSTRAINT uk_question_constr UNIQUE (id_task_stage, question_order)
    -- CONSTRAINT uk_question_constr UNIQUE (id_question_group, question_order)
);

-- CREATING TABLE option
CREATE TABLE option (
    id_option SERIAL NOT NULL,
    id_question INTEGER NOT NULL,
    content VARCHAR(1000) NOT NULL,
    feedback VARCHAR(200),
    correct BOOLEAN NOT NULL,
    preview_img_url VARCHAR(2048),
    preview_img_alt VARCHAR(200),
    main_img_url VARCHAR(2048),
    main_img_alt VARCHAR(200),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_option PRIMARY KEY (id_option),
    CONSTRAINT fk_option_question FOREIGN KEY (id_question) REFERENCES question(id_question)
);

-- CREATING TABLE institution
CREATE TABLE institution (
    id_institution SMALLSERIAL NOT NULL,
    name VARCHAR(100) NOT NULL,
    nit CHAR(9) NOT NULL,
    address VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone_code VARCHAR(5) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    website_url VARCHAR(2048),
    -- CONSTRAINTS
    CONSTRAINT pk_institution PRIMARY KEY (id_institution),
    CONSTRAINT uk_institution_nit UNIQUE (nit),
    CONSTRAINT uk_institution_email UNIQUE (email)
);

-- CREATING TABLE admin
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

-- CREATING TABLE teacher
CREATE TABLE teacher (
    id_teacher SMALLSERIAL NOT NULL,
    id_institution SMALLINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone_code VARCHAR(5) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    -- CONSTRAINTS
    CONSTRAINT pk_teacher PRIMARY KEY (id_teacher),
    CONSTRAINT fk_teacher_institution FOREIGN KEY (id_institution) REFERENCES institution(id_institution),
    CONSTRAINT uk_teacher_email UNIQUE (email),
    CONSTRAINT uk_teacher_username UNIQUE (username)
);

-- CREATING TABLE course
CREATE TABLE course (
    id_course SMALLSERIAL NOT NULL,
    id_teacher SMALLINT NOT NULL,
    id_institution SMALLINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    session BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_course PRIMARY KEY (id_course),
    CONSTRAINT fk_course_teacher FOREIGN KEY (id_teacher) REFERENCES teacher(id_teacher),
    CONSTRAINT fk_course_institution FOREIGN KEY (id_institution) REFERENCES institution(id_institution)
);

-- CREATING TABLE team
CREATE TABLE team (
    id_team SERIAL NOT NULL,
    id_course SMALLINT NOT NULL,
    id_team_name SMALLINT,
    name VARCHAR(50) NOT NULL,
    code CHAR(6),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    playing BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_team PRIMARY KEY (id_team),
    CONSTRAINT fk_team_team_name FOREIGN KEY (id_team_name) REFERENCES team_name(id_team_name),
    CONSTRAINT fk_team_course FOREIGN KEY (id_course) REFERENCES course(id_course)
);
CREATE UNIQUE INDEX idx_team_active_code ON team (code) WHERE active; -- code is unique only if the team is active

-- CREATING TABLE student
CREATE TABLE student (
    id_student SERIAL NOT NULL,
    id_course SMALLINT NOT NULL,
    id_blindness_acuity SMALLINT NOT NULL,
    id_visual_field_defect SMALLINT NOT NULL,
    id_color_deficiency SMALLINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    email VARCHAR(320),
    phone_code VARCHAR(5),
    phone_number VARCHAR(15),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- CONSTRAINTS
    CONSTRAINT pk_student PRIMARY KEY (id_student),
    CONSTRAINT fk_student_course FOREIGN KEY (id_course) REFERENCES course(id_course),
    CONSTRAINT fk_student_blindness_acuity FOREIGN KEY (id_blindness_acuity) REFERENCES blindness_acuity(id_blindness_acuity),
    CONSTRAINT fk_student_visual_field_defect FOREIGN KEY (id_visual_field_defect) REFERENCES visual_field_defect(id_visual_field_defect),
    CONSTRAINT fk_student_color_deficiency FOREIGN KEY (id_color_deficiency) REFERENCES color_deficiency(id_color_deficiency),
    CONSTRAINT uk_student_email UNIQUE (email),
    CONSTRAINT uk_student_username UNIQUE (username)
);

-- CREATING TABLE student_task
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

CREATE TYPE valid_power AS ENUM (
    'super_hearing',
    'memory_pro',
    'super_radar'
);

-- CREATING TABLE task_attempt
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

-- CREATING TABLE answer
CREATE TABLE answer (
    id_answer SERIAL NOT NULL,
    id_question INTEGER NOT NULL,
    id_option INTEGER,
    id_task_attempt INTEGER NOT NULL,
    id_team INTEGER,
    answer_seconds INTEGER,
    audio_url VARCHAR(2048),
    text VARCHAR(2048),
    -- CONSTRAINTS
    CONSTRAINT pk_answer PRIMARY KEY (id_answer),
    CONSTRAINT fk_answer_question FOREIGN KEY (id_question) REFERENCES question(id_question),
    CONSTRAINT fk_answer_option FOREIGN KEY (id_option) REFERENCES option(id_option),
    CONSTRAINT fk_answer_task_attempt FOREIGN KEY (id_task_attempt) REFERENCES task_attempt(id_task_attempt),
    CONSTRAINT fk_answer_team FOREIGN KEY (id_team) REFERENCES team(id_team)
    -- CONSTRAINT uk_answer UNIQUE (id_task_attempt, id_question, id_option) -- a student can only answer a question once per task_attempt
);

-- CREATING TABLE grade_answer
CREATE TABLE grade_answer (
    id_grade_answer SERIAL NOT NULL,
    id_answer INTEGER NOT NULL,
    id_teacher INTEGER NOT NULL,
    grade INTEGER NOT NULL,
    comment VARCHAR(2048),
    -- CONSTRAINTS
    CONSTRAINT pk_grade_answer PRIMARY KEY (id_grade_answer),
    CONSTRAINT fk_grade_answer_answer FOREIGN KEY (id_answer) REFERENCES answer(id_answer),
    CONSTRAINT fk_grade_answer_teacher FOREIGN KEY (id_teacher) REFERENCES teacher(id_teacher),
    CONSTRAINT check_grade_answer_grade CHECK (grade >= 0 AND grade <= 100),
    CONSTRAINT uk_grade_answer UNIQUE (id_answer, id_teacher) -- a teacher can only grade an answer once
);

-- CREATING TABLE release (mobile app releases)
CREATE TABLE release (
    id_release SMALLSERIAL NOT NULL,
    version VARCHAR(16) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- CONSTRAINTS
    CONSTRAINT pk_release PRIMARY KEY (id_release),
    CONSTRAINT uk_release_url UNIQUE (url),
    CONSTRAINT uk_release_version UNIQUE(version)
);

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
CREATE OR REPLACE FUNCTION validate_team_task() RETURNS TRIGGER AS $$
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

-- Throw exception if team not active is playing
CREATE OR REPLACE FUNCTION validate_team_playing() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.active = FALSE AND NEW.playing = TRUE THEN
    RAISE EXCEPTION 'Team not active cannot be playing';
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
CREATE TRIGGER validate_team_task_trigger
BEFORE INSERT OR UPDATE ON task_attempt
FOR EACH ROW
EXECUTE FUNCTION validate_team_task();

-- Trigger to check that a team cannot be inactive and playing at the same time
CREATE TRIGGER validate_team_playing_trigger
BEFORE INSERT OR UPDATE ON team
FOR EACH ROW
EXECUTE FUNCTION validate_team_playing();

-- INSERTING DATA

-- INSERT INTO blindness_acuity
INSERT INTO blindness_acuity (code, name, level, worse_than, better_eq_than) VALUES ('none', 'Ninguna', 0, NULL, '6/12 | 5/10 (0.5) | 20/40 | 0.3');
INSERT INTO blindness_acuity (code, name, level, worse_than, better_eq_than) VALUES ('mild', 'Leve', 1, '6/12 | 5/10 (0.5) | 20/40 | 0.3', '6/18 | 3/10 (0.3) | 20/70 | 0.5');
INSERT INTO blindness_acuity (code, name, level, worse_than, better_eq_than) VALUES ('moderate', 'Moderada', 2, '6/18 | 3/10 (0.3) | 20/70 | 0.5', '6/60 | 1/10 (0.1) | 20/200 | 1.0');
INSERT INTO blindness_acuity (code, name, level, worse_than, better_eq_than) VALUES ('severe', 'Severa', 3, '6/60 | 1/10 (0.1) | 20/200 | 1.0', '3/60 | 1/20 (0.05) | 20/400 | 1.3');
INSERT INTO blindness_acuity (code, name, level, worse_than, better_eq_than) VALUES ('blindness_4', 'Ceguera (categoría 4)', 4, '3/60 | 1/20 (0.05) | 20/400 | 1.3', '1/60 | 1/50 (0.02) | 20/1200 | 1.8');
INSERT INTO blindness_acuity (code, name, level, worse_than, better_eq_than) VALUES ('blindness_5', 'Ceguera (categoría 5)', 5, '1/60 | 1/50 (0.02) | 5/300 (20/1200) | 1.8', 'Percepción de luz');
INSERT INTO blindness_acuity (code, name, level, worse_than, better_eq_than) VALUES ('blindness_6', 'Ceguera (categoría 6)', 6, 'Sin percepción de luz', NULL);

-- INSERT INTO color_deficiency
INSERT INTO color_deficiency (code, name, description) VALUES ('none', 'Ninguna', 'No tiene ninguna deficiencia de percepción de color.');
INSERT INTO color_deficiency (code, name, description) VALUES ('protanopia', 'Protanopía', 'Sensitividad nula hacia la luz roja. El individuo no puede distinguir entre el rojo y el verde.');
INSERT INTO color_deficiency (code, name, description) VALUES ('protanomaly', 'Protanomalía', 'Sensitividad reducida hacia la luz roja. El individuo tiene dificultades para distinguir entre el rojo y el verde.');
INSERT INTO color_deficiency (code, name, description) VALUES ('deuteranopia', 'Deuteranopía', 'Sensitividad nula hacia la luz verde. El individuo no puede distinguir entre el verde y el amarillo.');
INSERT INTO color_deficiency (code, name, description) VALUES ('deuteranomaly', 'Deuteranomalía', 'Sensitividad reducida hacia la luz verde. El individuo tiene dificultades para distinguir entre el verde y el amarillo.');
INSERT INTO color_deficiency (code, name, description) VALUES ('tritanopia', 'Tritanopía', 'Sensitividad nula hacia la luz azul. El individuo no puede distinguir entre el azul y el amarillo.');
INSERT INTO color_deficiency (code, name, description) VALUES ('tritanomaly', 'Tritanomalía', 'Sensitividad reducida hacia la luz azul. El individuo tiene dificultades para distinguir entre el azul y el amarillo.');
INSERT INTO color_deficiency (code, name, description) VALUES ('achromatopsia', 'Achromatopsia', 'El individuo no puede distinguir entre los colores.');
INSERT INTO color_deficiency (code, name, description) VALUES ('achromatomaly', 'Achromatomalía', 'El individuo tiene dificultades para distinguir entre los colores.');

-- INSERT INTO visual_field_defect
INSERT INTO visual_field_defect (code, name, description) VALUES ('none', 'Ninguna', 'No tiene ninguna deficiencia en el campo visual.');
INSERT INTO visual_field_defect (code, name, description) VALUES ('scotoma', 'Escotoma', 'Un punto ciego en el campo visual que puede ser causado por varias condiciones, como el glaucoma o una lesión cerebral.');
INSERT INTO visual_field_defect (code, name, description) VALUES ('quadrantanopia', 'Cuadrantanopsia', 'Una condición en la que se pierde una cuarta parte del campo visual, típicamente en un cuadrante.');
INSERT INTO visual_field_defect (code, name, description) VALUES ('tunnel_vision', 'Visión de túnel', 'Una condición en la que se pierde la visión periférica, dejando solo un pequeño campo de visión central.');
INSERT INTO visual_field_defect (code, name, description) VALUES ('hemianopia_homonymous_left', 'Hemianopsia homónima izquierda', 'Una condición donde la mitad izquierda del campo visual se pierde en ambos ojos.');
INSERT INTO visual_field_defect (code, name, description) VALUES ('hemianopia_homonymous_right', 'Hemianopsia homónima derecha', 'Una condición donde la mitad derecha del campo visual se pierde en ambos ojos.');
INSERT INTO visual_field_defect (code, name, description) VALUES ('hemianopia_heteronymous_binasal', 'Hemianopsia binasal', 'Una condición en la que falta la visión en la mitad interna del campo visual derecho e izquierdo.');
INSERT INTO visual_field_defect (code, name, description) VALUES ('hemianopia_heteronymous_bitemporal', 'Hemianopsia bitemporal', 'Una condición en la que falta la visión en la mitad exterior del campo visual derecho e izquierdo.');

-- INSERT INTO task
-- <a href="https://www.freepik.es/foto-gratis/puente-cable-murom-traves-oka_1469557.htm#page=2&query=bridge&position=0&from_view=search&track=sph">Imagen de bearfotos</a> en Freepik
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url, thumbnail_alt, coming_soon) VALUES (1, 'Journey to the Mangroves', 'Únete a un viaje virtual al Parque Isla Salamanca, mientras aprendes frases básicas en inglés relacionadas con los viajes y la naturaleza.', '¡Prepárate para un divertido viaje desde Barranquilla hasta el Parque Isla Salamanca! Aprenderemos nuevas palabras y frases relacionadas con los viajes y la naturaleza, como "camino", "puente", "manglar" y "parque natural". ¿Estás emocionado?', '{ "vocabulary", "prepositions", "journey", "nature" }', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/thumbnail_1.jpg', 'Imagen de la task', FALSE);
-- <a href="https://www.freepik.es/foto-gratis/ancho-rio-cerca-rio-negro-jamaica-paisaje-exotico-manglares_14875432.htm#query=mangrove%20swamp&position=33&from_view=search&track=ais">Imagen de mb-photoarts</a> en Freepik
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url, thumbnail_alt, coming_soon) VALUES (2, 'Meet the Animals', 'Explora la vida silvestre de los manglares, aprendiendo nombres de animales, hábitos y hábitats.', '¡Exploremos la increíble vida salvaje de los manglares! Conoceremos diferentes animales, como aves, mamíferos y reptiles, y aprenderemos a decir sus nombres y dónde viven. ¡Prepárate para divertirte y aprender cosas nuevas!', '{ "personal presentation", "sounds", "nature", "animals", "habitats" }', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/thumbnail_1.jpg', 'Imagen de la task', FALSE);
-- Foto de Tom Fisk: https://www.pexels.com/es-es/foto/arboles-verdes-2666806/
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url, thumbnail_alt, coming_soon) VALUES (3, 'Eco Adventures', 'Embárcate en aventuras ecológicas, como caminatas, kayak y pesca, mientras practicas frases en inglés relacionadas con actividades al aire libre y conciencia ambiental.', '¡Es hora de algunas aventuras ecológicas en los manglares! Haremos senderismo, kayak y pesca, mientras aprendemos nuevas frases en inglés relacionadas con actividades al aire libre, como "¡vamos!", "Me estoy divirtiendo" y "esto es hermoso". También aprenderemos cómo cuidar el medio ambiente y por qué es importante proteger los manglares. ¿Estás preparado para el reto?', '{ "eco-friendly", "adventures", "hiking", "kayaking", "fishing", "phrases", "outdoor activities", "environmental awareness" }', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/thumbnail_1.jpg', 'Imagen de la task', FALSE);
-- Foto de icon0.com: https://www.pexels.com/es-es/foto/madera-paisaje-naturaleza-verano-726298/
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url, thumbnail_alt, coming_soon) VALUES (4, 'Local Culture', 'Descubre la cultura local y las tradiciones de las comunidades que rodean el Parque Isla Salamanca, aprendiendo sobre comida, música, danza y artesanía.', '¡Descubramos la cultura local y las tradiciones de las comunidades que rodean el Parque Isla Salamanca! Aprenderemos a decir hola y cómo estás en inglés, y también aprenderemos sobre la deliciosa comida, la música divertida, el baile colorido y las hermosas artesanías que hacen que este lugar sea especial. ¡Incluso podrás practicar algunas expresiones en inglés y tener una conversación virtual con un amigo local!', '{ "local culture", "traditions", "food", "music", "dance", "crafts", "greetings", "expressions", "social interaction" }', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/thumbnail_1.jpg', 'Imagen de la task', FALSE);
-- Foto de Marcel Kodama: https://www.pexels.com/es-es/foto/bosque-de-bambu-con-hilera-de-arboles-en-un-dia-soleado-3632689/
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url, thumbnail_alt, coming_soon) VALUES (5, 'The Great Challenge', 'Usa todo tu dominio del inglés para resolver un misterio o completar un rompecabezas relacionado con los manglares, consolidando tu aprendizaje y divirtiéndote.', '¿Estás listo para el último desafío? En esta tarea final, deberás usar todas tus habilidades en inglés para resolver un misterio o completar un rompecabezas relacionado con la historia, geografía y ecología de los manglares. Te divertirás y aprenderás al mismo tiempo, mientras consolidas todos los conocimientos adquiridos durante las tareas anteriores. ¿Tienes lo que se necesita para ser un gran estudiante de inglés?', '{ "English skills", "mystery", "puzzle", "mangroves", "learning", "fun" }', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/thumbnail_1.jpg', 'Imagen de la task', FALSE);

-- INSERT INTO team_name
INSERT INTO team_name (id_team_name, name) VALUES (1, 'Ospreys');
INSERT INTO team_name (id_team_name, name) VALUES (2, 'Lizards');
INSERT INTO team_name (id_team_name, name) VALUES (3, 'Alligators');
INSERT INTO team_name (id_team_name, name) VALUES (4, 'Manatees');
-- INSERT INTO team_name (id_team_name, name) VALUES (5, 'Ocelots');
-- INSERT INTO team_name (id_team_name, name) VALUES (6, 'Seagulls');
-- INSERT INTO team_name (id_team_name, name) VALUES (7, 'Herons');
-- INSERT INTO team_name (id_team_name, name) VALUES (8, 'Ducks');
-- INSERT INTO team_name (id_team_name, name) VALUES (9, 'Opossums');
-- INSERT INTO team_name (id_team_name, name) VALUES (10, 'Sea bass');
-- INSERT INTO team_name (id_team_name, name) VALUES (11, 'Hummingbird');

-- INSERT INTO question and option
-- square brackets: super_radar; curly braces: memory_pro
DO $$
DECLARE
    last_question_id INTEGER;
    last_question_group_id INTEGER;
BEGIN
    -- questions from task 1
    
    -- pretask 1
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 1, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un camino', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_2.jpg', 'vocabulary', NULL, 'La imagen muestra un camino.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Road', '¡Muy bien! La imagen muestra un camino.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un camino, no un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Bridge', '¡Uy!, no es correcto. La imagen muestra un camino, no un puente.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 2, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un parque natural', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/natural_park_2.jpg', 'vocabulary', NULL, 'La imagen muestra un parque natural.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Natural park', '¡Muy bien! La imagen muestra un parque natural.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Farm', '¡Uy!, no es correcto. La imagen muestra un parque natural, no un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un parque natural, no un río.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 3, 'Bridge', NULL, NULL, 'audio_select', 'Imagen de un puente', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bridge_1.jpg', 'vocabulary', NULL, 'La imagen muestra un puente.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Bridge', '¡Muy bien!.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Toll', '¡Uy!, no es correcto. Vuelve a escuchar atentamente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Farm', '¡Uy!, no es correcto. Vuelve a escuchar atentamente.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 4, 'The road is _ the natural park', NULL, NULL, 'fill', 'Imagen de un camino al lado de un parque natural', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_natural_park_1.jpg', 'prepositions', NULL, 'La imagen muestra un camino al lado de un parque natural.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'next to', '¡Excelente! "Next to" es la respuesta correcta, indica que el camino está al lado del parque natural.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'under', 'Incorrecto. "Under" se usa cuando algo está debajo de dos cosas. La respuesta correcta es "next to".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'over', 'Incorrecto. "Over" indica que algo está encima de otro objeto. La respuesta correcta es "next to".', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 5, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/mangrove_1.jpg', 'vocabulary', NULL, 'La imagen muestra un manglar.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Muy bien! La imagen muestra un manglar.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Beach', '¡Uy!, no es correcto. La imagen muestra un manglar, no una playa.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Farm', '¡Uy!, no es correcto. La imagen muestra un manglar, no una granja.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 6, 'The mangrove is _ the natural park', NULL, NULL, 'fill', 'Imagen de un manglar en un parque natural', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/mangrove_water_1.jpg', 'prepositions', NULL, 'La imagen muestra un manglar en el agua.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'in', '¡Correcto! La respuesta es "in".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'on', 'Incorecto, "On" se usa para indicar que algo está sobre una superficie. La respuesta correcta es "in".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'at', 'Incorrecto, "At" se usa para indicar que algo está en un lugar específico. La respuesta correcta es "in".', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 7, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/swamp_1.jpg', 'vocabulary', NULL, 'La imagen muestra un pantano.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Muy bien! La imagen muestra un pantano.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Toll', '¡Uy!, no es correcto. La imagen muestra un pantano, no un peaje.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un pantano, no una granja.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 8, 'El camino está entre Barranquilla y el parque natural', NULL, NULL, 'order', 'Imagen de un camino entre Barranquilla e Isla Salamanca', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_1.jpg', 'prepositions', NULL, 'La imagen muestra un camino entre Barranquilla e Isla Salamanca.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'The road is between Barranquilla and the natural park', '¡Correcto!', TRUE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 9, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un bote', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/boat_1.jpg', 'vocabulary', NULL, 'La imagen muestra un bote.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Boat', '¡Muy bien! La imagen muestra un bote.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hotel', '¡Uy!, no es correcto. La imagen muestra agua, pero también un bote sobre ella.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Beach', '¡Uy!, no es correcto. La imagen muestra un bote, no una playa.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 10, 'The bridge is over the water', NULL, NULL, 'audio_order', 'Imagen de un puente sobre el agua', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bridge_river_1.jpg', 'prepositions', NULL, 'La imagen muestra un puente sobre el agua.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'The bridge is over the water', '¡Correcto!', TRUE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (1, NULL, 11, 'The natural park is near Barranquilla', NULL, NULL, 'audio_speaking', 'Imagen de un parque natural cerca de Barranquilla', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_1.jpg', 'prepositions', NULL, 'La imagen muestra un parque natural cerca de Barranquilla.', 'en') RETURNING id_question INTO last_question_id;

    -- duringtask 1
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (2, NULL, 1, 'Bienvenidos, ¡yo seré su guía turístico! Les estaré haciendo unas preguntas durante el recorrido.\Are you [on|sobre] the {bridge|puente}?', NULL, NULL, 'select', 'Imagen de personas sobre un puente', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bridge_1.jpg', NULL, 'beto', 'La imagen muestra personas sobre un puente.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, we are', '¡Correcto!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, we aren''t', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, we aren''t', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, we are', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there is', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (2, NULL, 2, '¡Espero que estén disfrutando del recorrido! Ahora, miren el puente.\Is there a {river|río} [under|debajo] the {bridge|puente}?', NULL, NULL, 'select', 'Imagen de un río bajo un puente', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bridge_river_1.jpg', NULL, 'beto', 'La imagen muestra un río bajo un puente.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there is', '¡Correcto!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there aren''t', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there isn''t', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, we are', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, she isn''t', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (2, NULL, 3, '¡Qué emoción! Cerca se puede ver el pueblo de Palermo.\Look at the {road|camino}. Is there a {town|pueblo} [near|cerca de] it?', NULL, NULL, 'select', 'Imagen de un pueblo cerca de un camino', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/town_road_1.jpg', NULL, 'beto', 'La imagen muestra un pueblo cerca de un camino.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Palermo town is near the road', '¡Correcto!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tasajera town is behind the road', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Palermo town is on the bridge', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tasajera town is under the river', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Palermo town is near Bogotá', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tasajera town isn''t near Palermo', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (2, NULL, 4, 'Luego de pasar por un hotel, estamos en el peaje Laureano Gómez. La siguiente parada será la granja Terranova.\Where is Laureano Gomez {toll|peaje}?', NULL, NULL, 'select', 'Imagen de un peaje entre un hotel y una granja', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/toll_1.jpg', NULL, 'beto', 'La imagen muestra un peaje entre un hotel y una granja.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the hotel and Terranova farm', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the beach and the river', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the toll and the road', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the bridge and the river', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the beach and the road', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the hotel and the beach', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (2, NULL, 5, '¡A lo lejos se puede ver una costa!\Is Playa Linda {beach|playa} [far from|lejos de] Barranquilla?', NULL, NULL, 'select', 'Imagen de una playa lejos de Barranquilla', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_beach_1.jpg', NULL, 'beto', 'La imagen muestra una playa lejos de Barranquilla.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, it is', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, it isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, it isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, it is', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, he is', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (2, NULL, 6, 'El paisaje aquí es fascinante.\Are there {swamps|pantanos} [near|cerca de] the {beach|playa}?', NULL, NULL, 'select', 'Imagen de una playa con pantanos cerca', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/beach_swamps_1.jpg', NULL, 'beto', 'La imagen muestra una playa con pantanos cerca.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there are', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there aren''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there are', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there is', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (2, NULL, 7, '¡Ya estamos por terminar nuestro recorrido!\Is there a {farm|granja} [next to|junto a] Salamanca Island?', NULL, NULL, 'select', 'Imagen de una granja cerca de Isla Salamanca', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/farm_1.jpg', NULL, 'beto', 'La imagen muestra una granja cerca de Isla Salamanca.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there is', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there are', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there aren''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there aren''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there is', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (2, NULL, 8, '¡Bienvenidos al Parque Isla Salamanca!\What is there [over|encima de] the {mangrove|manglar}?', NULL, NULL, 'select', 'Imagen de un manglar con un pajaro encima', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bird_mangrove_1.jpg', NULL, 'beto', 'La imagen muestra un manglar con un pajaro encima.', 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A bird', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A boat', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A fish', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A tree', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A flower', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A house', 'Incorrect', FALSE);
    
    -- postask 1

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (3, NULL, 1, '¡Hemos llegado al final! Revisemos lo aprendido con unas preguntas. Are there boats next to the road?', NULL, NULL, 'select&speaking', NULL, NULL, NULL, 'beto', NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there are.', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there aren''t.', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (3, NULL, 2, 'What is there over the river?', NULL, NULL, 'select&speaking', NULL, NULL, NULL, 'beto', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A bridge', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A hotel', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (3, NULL, 3, 'What was part of the road?', NULL, NULL, 'select&speaking', NULL, NULL, NULL, 'beto', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A toll', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A tunnel', 'Incorrect', FALSE);

    -- questions from task 2
    
    -- pretask 2

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 1, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de una gaviota.', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/seagull_1.jpg', 'vocabulary', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Seagull', '!Uy! ¡Casi! Era correcto.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Duck', '!Uy! ¡Casi! Es una gaviota.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Monkey', '!Uy! Ese no es el animal de la imagen.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 2, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/alligator_1.jpg', 'vocabulary', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Alligator', '!Uy! ¿Seguro de que no es un caimán?', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Frog', '!Uy! Revisa la imagen.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Turtle', '!Uy! ¿Estás seguro?', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 3, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de un ocelote', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/ocelot_1.jpg', 'vocabulary', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocelot', '!Uy! Este sí es un ocelote.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Cat', '!Uy! No es del todo un gato.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Puma', '!Uy! ¿Estás seguro?', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 4, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de un zorrochucho', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/common_opossum_1.jpg', 'vocabulary', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Common opossum', '!Uy! Este sí es un zorrochucho.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Dog', '!Uy! No es un perro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fox', '!Uy! Casi, pero no.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 5, '¿Cuál es el hábitat de un águila pescadora?', NULL, NULL, 'select', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/osprey_1.jpg', 'vocabulary', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aerial', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Terrestrial', '!Uy! ¿Estás seguro?', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aquatic', '!Uy! Aunque se alimenta de peces, no vive en el agua.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 6, 'Alligator', NULL, NULL, 'audio_order-word', 'Imagen de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/alligator_1.jpg', 'vocabulary', NULL, NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Alligator', 'Correct', TRUE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 7, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de un manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/manatee_1.jpg', 'vocabulary', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Manatee', '!Uy! Este sí es un manatí.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Dolphin', '!Uy! No es un delfín.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Whale', '!Uy! No hay ballenas en este hábitat.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 8, '¿Cuál es el hábitat de un róbalo?', NULL, NULL, 'select', 'Imagen de un róbalo bajo el agua', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/seabass_1.jpg', 'vocabulary', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aquatic', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Terrestrial', '!Uy! ¿Estás seguro?', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aerial', '!Uy! No todos los peces vuelan.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 9, '¿Qué se dice al encontrarse con alguien por primera vez?', NULL, NULL, 'select', 'Imagen de personas conociéndose', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/personal_presentation_1.jpg', 'personal_presentation', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Nice to meet you', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'See you later', 'No deberías despedirte si acabas de conocer a alguien', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'How are you?', 'No es una presentación', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 10, '¿Cómo se pregunta a alguien de dónde es?', NULL, NULL, 'select', 'Imagen de una persona preguntando a otra de dónde es', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/personal_presentation_2.jpg', 'personal_presentation', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Where are you from?', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'How are you?', '"How are you?" significa "¿Cómo estás?"', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'What do you do?', '"What do you do?" significa "¿Qué haces?"', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 11, 'Tengo 14 años', NULL, NULL, 'order', 'Imagen de una persona diciendo su edad', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/personal_presentation_3.jpg', 'personal_presentation', NULL, NULL, 'es') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I am 14 years old', 'Correct', TRUE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (4, NULL, 12, 'I''m from Colombia', NULL, NULL, 'audio_speaking', 'Imagen de una persona diciendo que es de Colombia', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/personal_presentation_4.jpg', 'personal_presentation', NULL, NULL, 'en') RETURNING id_question INTO last_question_id;

    -- duringtask 2

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 1, '¡Gusto en conocerlos! Me llamo Valery y yo los ayudaré a conocer los animales y a presentarse. Estamos frente a un ocelote.\The {ocelot|ocelote} likes to move [among|entre] {trees|árboles}. What do you like to do?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/ocelot_1.mp3', NULL, 'select', 'Imagen de un ocelote en un árbol', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/ocelot_tree_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like to go to school', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like apples', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I go to school', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I''m going to school', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It likes to move among trees', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I like', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 2, '¡Miren ese pato nadando en el río!\The {duck|pato} lives [near|cerca de] the {water|agua}. Where do you live?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/duck_1.mp3', NULL, 'select', 'Imagen de un pato cerca del río', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/duck_river_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I live in Barranquilla', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I am from Colombia', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It lives near the water', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It lives in Isla Salamanca', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I go to school', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 3, '¡Miren hacia arriba! Es un majestuoso águila pescadora.\The {osprey|águila pescadora} goes fishing [during|durante] the {day|día}. What do you do in the {morning|mañana}?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/osprey_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I have breakfast in the morning', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like to eat in the afternoon', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I have lunch in the morning', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It goes fishing during the morning', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It goes fishing', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 4, 'Observen bajo el agua. ¡Es un amigable manatí!\The {manatee|manatí} rests [on|en] the {river|río} {bottom|fondo}. Where do you rest?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/manatee_water_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I rest at home', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I rest in the school', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I rest at night', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It rests on the river bottom', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It rests on the river', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I rest in the morning', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 5, 'Miren esa elegante garza\The {heron|garza} stays [over|en] the {water|agua} to relax. How do you relax?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/heron_1.mp3', NULL, 'select', 'Imagen de una garza relajada', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/heron_water_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like to read a book', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I''m reading a book', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I reads books', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I likes to read a book', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It relaxes on the water', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I read a books', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 6, '¡Cuidado con el caimán!\The {alligator|caimán} swims [under|bajo] the {water|agua}. Do you like to swim?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán nadando', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/alligator_water_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like to swim', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I''m swimming', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I swims', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I likes to swim', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It swims under the water', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I drink water', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 7, 'Shhh, pueden espantar a la gaviota.\The {seagull|gaviota} eats {fish|pescado} [from|de] the {river|río}. Do you eat {fish|pescado}?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/seagull_1.mp3', NULL, 'select', 'Imagen de una gaviota', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/seagull_fish_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I eats', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I eat', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I am', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It eats fish', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I eats fish', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 8, '¡Miren ese róbalo saltando en el agua!\The {sea bass|robalo} jumps [out of|fuera de] the {water|agua}. Can you jump high?', NULL, NULL, 'select', 'Imagen de un robalo saltando', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/seabass_2.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I can', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I can''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I can', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I don''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It can jump', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 9, '¡Qué bonito colibrí!\The {hummingbird|colibrí} flies [around|alrededor de] the {flowers|flores}. What is your favorite {flower|flor}?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/hummingbird_1.mp3', NULL, 'select', 'Imagen de un colibrí', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/hummingbird_flower_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like orchids', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It likes orchids', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I likes orchids', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It flies around the flowers', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I don''t', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (5, NULL, 10, '¡No se asusten del lagarto!\The {lizard|lagarto} likes the {sun|sol} [on top of|encima de] the {rocks|rocas}. How do you feel in the {sun|sol}?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/lizard_rocks_1.jpg', NULL, 'valery', NULL, 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel happy', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel in the sun', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel likes the sun', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel the sun likes me', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel is sunny', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel are hot', 'Incorrect', FALSE);

    -- postask 2

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (6, NULL, 1, '!Hola! Soy el zorro Chucho y te haré unas preguntas. Can you present yourself in english?', NULL, NULL, 'open', NULL, NULL, NULL, 'chucho', 'My name is _, I''m _ years old, I''m from _ and I like _', 'en') RETURNING id_question INTO last_question_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (6, NULL, 2, '¡Bien hecho! Última pregunta: what''s your favorite animal from Isla Salamanca?', NULL, NULL, 'open', NULL, NULL, NULL, 'chucho', 'My favorite animal is _', 'en') RETURNING id_question INTO last_question_id;
    
    -- questions from task 3
    
    -- pretask 3

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (7, NULL, 1, 'Select the habitat', NULL, NULL, 'select', 'Imagen de un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/swamp_1.jpg', 'vocabulary', NULL, 'La imagen muestra un pantano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Muy bien! La imagen muestra un patano.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', '¡Uy!, no es correcto. La imagen muestra un pantano, no un océano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un patano, no un manglar.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (7, NULL, 2, 'Select the name', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_1.jpg', 'vocabulary', NULL, 'La imagen muestra un águila pescadora.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto (Osprey)', '¡Muy bien! La imagen muestra un águila pescadora.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina (Lizard)', '¡Uy!, no es correcto. La imagen muestra un águila pescadora, no un lagarto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly (Manatee)', '¡Uy!, no es correcto. La imagen muestra un águila pescadora, no un manatí.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (7, NULL, 3, 'Select the age', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/ocelot_1.mp3', NULL, 'select', 'Imagen de un ocelote adulto, de aproximadamente 15 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/ocelot_15yo_1.jpg', 'vocabulary', NULL, 'La imagen muestra un ocelote adulto, de aproximadamente 15 años.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Muy bien! La imagen muestra un ocelote de 15 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un ocelote de 15 años, no un ocelote de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un ocelote de 15 años, no un ocelote de 7 años.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (7, NULL, 4, 'Select the body part', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de la cola de un lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_tail_1.jpg', 'vocabulary', NULL, 'La imagen muestra la cola de un lagarto.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Muy bien! La imagen muestra la cola de un lagarto.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no unos dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Wing', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no unas alas.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (7, NULL, 5, 'Select the skills', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/duck_1.mp3', NULL, 'select', 'Imagen de un pato mostrando sus habilidades para nadar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/duck_swim_1.jpg', 'vocabulary', NULL, 'La imagen muestra un pato nadando.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Muy bien! La imagen muestra un pato nadando.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un pato nadando, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Uy!, no es correcto. La imagen muestra un pato nadando, no volando.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (7, NULL, 6, 'Select the diet', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/seagull_1.mp3', NULL, 'select', 'Imagen de una gaviota pescando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/seagull_fish_1.jpg', 'vocabulary', NULL, 'La imagen muestra una gaviota pescando.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Muy bien! La imagen muestra una dieta carnívora.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. La imagen muestra una dieta carnívora, no omnívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. La imagen muestra una dieta carnívora, no herbívora.', FALSE);

    -- duringtask 3
    
    UPDATE task_stage SET mechanics = '{"question_group-team_name"}' WHERE id_task_stage = 8;

    INSERT INTO question_group (id_team_name) VALUES (1) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 1, 'Where do ospreys live?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora en un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_mangrove_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora en un manglar.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Muy bien! La imagen muestra un águila pescadora en un manglar.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un océano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Coast', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en una costa.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lake', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un lago.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 2, 'What''s the osprey''s name?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora llamada Otto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora llamada Otto.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Muy bien! La imagen muestra un águila pescadora llamada Otto.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Olivia', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Olivia.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Molly.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Nicolas', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Nicolas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mary', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Mary.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 3, 'How old is the osprey?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora de 7 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_7yo_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora de 7 años.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Muy bien! La imagen muestra un águila pescadora de 7 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 15 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '20 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 20 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '25 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 25 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '30 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 30 años.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 4, 'Select the body part of the osprey', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de las alas de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_wings_1.jpg', NULL, NULL, 'La imagen muestra las alas de un águila pescadora.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Wing', '¡Muy bien! La imagen muestra las alas de un águila pescadora.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra las alas de un águila pescadora, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra las alas de un águila pescadora, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra las alas de un águila pescadora, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Eyes', '¡Uy!, no es correcto. La imagen muestra las alas de un águila pescadora, no sus ojos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Head', '¡Uy!, no es correcto. La imagen muestra las alas de un águila pescadora, no su cabeza.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 5, 'Select the skill of the osprey', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora volando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_fly_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora volando.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Muy bien! La imagen muestra un águila pescadora volando.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Jump', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no saltando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Climb', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no escalando.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 6, 'Select the diet of the osprey', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora pescando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_fish_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora pescando.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Muy bien! El águila pescadora es carnívora.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no herbívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no omnívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Insectivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no insectívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Frugivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no frugívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Granivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no granívora.', FALSE);
    
    INSERT INTO question_group (id_team_name) VALUES (2) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 7, 'Where do lizards live?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto en un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_swamp_1.jpg', NULL, NULL, 'La imagen muestra un lagarto en un pantano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Muy bien! La imagen muestra un lagarto en un pantano.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un océano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lake', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un lago.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Coast', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en una costa.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 8, 'What''s the lizard''s name?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de una lagarto llamada Lina', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_1.jpg', NULL, NULL, 'La imagen muestra una lagarto llamada Lina.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Muy bien! La imagen muestra una lagarto llamada Lina.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Molly.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aldo', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Aldo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mary', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Mary.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Nicolas', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Nicolas.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 9, 'How old is the lizard?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto de 11 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_11yo_1.jpg', NULL, NULL, 'La imagen muestra un lagarto de 11 años.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Muy bien! La imagen muestra un lagarto de 11 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 15 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '20 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 20 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '25 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 25 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '30 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 30 años.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 10, 'Select the body part of the lizard', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de la cola de un lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_tail_1.jpg', NULL, NULL, 'La imagen muestra la cola de un lagarto.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Muy bien! La imagenla muestra la cola de un lagarto.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Eyes', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus ojos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Legs', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus patas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ears', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus orejas.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 11, 'Select the skill of the lizard', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto corriendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_run_1.jpg', NULL, NULL, 'La imagen muestra un lagarto corriendo.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Muy bien! La imagen muestra un lagarto corriendo.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no volando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Sleep', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no durmiendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Eat', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no comiendo.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 12, 'Select the diet of the lizard', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto comiendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_eat_1.jpg', NULL, NULL, 'La imagen muestra un lagarto comiendo.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Muy bien! El lagarto es omnívoro.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no herbívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no carnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Insivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no insectívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Frugivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no frugívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Granivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no granívoro.', FALSE);
    
    INSERT INTO question_group (id_team_name) VALUES (3) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 13, 'Where do alligators live?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán en un río', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_river_1.jpg', NULL, NULL, 'La imagen muestra un caimán en un río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Muy bien! La imagen muestra un caimán en un río.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lake', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un lago.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Coast', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en la costa.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en el océano.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 14, 'What''s the alligator''s name?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán llamado Aldo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_1.jpg', NULL, NULL, 'La imagen muestra un caimán llamado Aldo.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aldo', '¡Muy bien! La imagen muestra un caimán llamado Aldo.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Molly.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mary', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Mary.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Nicolas', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Nicolas.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 15, 'How old is the alligator?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán de 5 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_5yo_1.jpg', NULL, NULL, 'La imagen muestra un caimán de 5 años.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '5 years old', '¡Muy bien! La imagen muestra un caimán de 5 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 15 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '20 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 20 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '25 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 25 años.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 16, 'Select the body part of the alligator', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de las garras de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_claws_1.jpg', NULL, NULL, 'La imagen muestra las garras de un caimán.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Muy bien! La imagenla muestra las garras de un caimán.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Eyes', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no sus ojos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Nose', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no su nariz.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ears', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no sus orejas.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 17, 'Select the skill of the alligator', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán escondiéndose', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_hide_1.jpg', NULL, NULL, 'La imagen muestra un caimán escondiéndose.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Muy bien! La imagen muestra un caimán escondiéndose.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no volando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Climb', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no escalando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Jump', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no saltando.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 18, 'Select the diet of the alligator', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán comiendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_eat_1.jpg', NULL, NULL, 'La imagen muestra un caimán comiendo.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Muy bien! El caimán es carnívoro.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no herbívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no omnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Insectivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no insectívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Frugivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no frugívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Granivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no granívoro.', FALSE);
    
    INSERT INTO question_group (id_team_name) VALUES (4) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 19, 'Where do manatees live?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí en un océano', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_ocean_1.jpg', NULL, NULL, 'La imagen muestra un manatí en un océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', '¡Muy bien! La imagen muestra un manatí en un océano.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lake', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un lago.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Coast', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en una costa.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 20, 'What''s the manatee''s name?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de una manatí llamada Molly', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_1.jpg', NULL, NULL, 'La imagen muestra una manatí llamada Molly.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Muy bien! La imagen muestra una manatí llamada Molly.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aldo', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Mary.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mary', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Mary.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Nicolas', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Nicolas.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 21, 'How old is the manatee?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí de 15 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_15yo_1.jpg', NULL, NULL, 'La imagen muestra un manatí de 15 años.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Muy bien! La imagen muestra un manatí de 15 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '20 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 20 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '25 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 25 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '30 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 30 años.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 22, 'Select the body part of the manatee', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de los dientes de un manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_teeth_1.jpg', NULL, NULL, 'La imagen muestra los dientes de un manatí.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Muy bien! La imagenla muestra los dientes de un manatí.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Eyes', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no sus ojos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ears', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no sus orejas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Elbows', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no sus codos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Nose', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no su nariz.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 23, 'Select the skill of the manatee', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí nadando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_swim_1.jpg', NULL, NULL, 'La imagen muestra un manatí nadando.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Muy bien! La imagen muestra un manatí nadando.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no volando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Jump', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no saltando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Climb', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no escalando.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (8, last_question_group_id, 24, 'Select the diet of the manatee', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí comiendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_eat_1.jpg', NULL, NULL, 'La imagen muestra un manatí comiendo.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Muy bien! El manatí es herbívoro.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no carnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no omnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Insectivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no insectívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Frugivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no frugívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Granivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no granívoro.', FALSE);
    
    -- postask 3
    
    UPDATE task_stage SET mechanics = '{"question_group-duringtask_based"}' WHERE id_task_stage = 9;

    INSERT INTO question_group (id_team_name) VALUES (1) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 1, 'An osprey is lost. His _ is Otto.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'fill', 'Imagen de un águila pescadora perdida', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora perdida.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'name', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'habitat', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'food', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 2, 'An osprey is lost. His name is Otto. He _ 7 years old.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'fill', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'is', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'are', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'am', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 3, 'An osprey is lost. His name is Otto. He is 7 years old. He lives in a _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'fill', 'Imagen de un águila pescadora en un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora en un manglar.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'mangrove', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'swamp', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'ocean', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 4, 'An osprey is lost. His name is Otto. He is 7 years old. He lives in a mangrove. He has brown and white _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'fill', 'Imagen de un águila pescadora con grandes alas', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora con grandes alas.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'wings', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'teeth', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'claws', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 5, 'An osprey is lost. His name is Otto. He is 7 years old. He lives in a mangrove. He has brown and white wings, so he can _ and hunt fish.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'fill', 'Imagen de un águila pescadora volando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora volando.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'fly', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'swim', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'run', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 6, 'An osprey is lost. His name is Otto. He is 7 years old. He lives in a mangrove. He has brown and white wings, so he can fly and hunt fish. Is he _? Yes!', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'fill', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'carnivorous', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'herbivorous', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'omnivorous', 'Incorrecto.', FALSE);

    INSERT INTO question_group (id_team_name) VALUES (2) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 7, 'A lizard is lost. Her _ is Lina.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'fill', 'Imagen de una lagarto perdida', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra una lagarto perdida.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'name', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'habitat', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'food', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 8, 'A lizard is lost. Her name is Lina. She _ 11 years old.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'fill', 'Imagen de una lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra una lagarto.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'is', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'am', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'are', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 9, 'A lizard is lost. Her name is Lina. She is 11 years old. She lives in a _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'fill', 'Imagen de una lagarto en un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra una lagarto en un pantano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'swamp', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'river', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'coast', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 10, 'A lizard is lost. Her name is Lina. She is 11 years old. She lives in a swamp. She has a long _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'fill', 'Imagen de una lagarto con una cola larga', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra un lagarto con una cola larga.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'tail', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'neck', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'hair', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 11, 'A lizard is lost. Her name is Lina. She is 11 years old. She lives in a swamp. She has a long tail and she can _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'fill', 'Imagen de una lagarto corriendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra una lagarto corriendo.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'run', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'swim', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'fly', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 12, 'A lizard is lost. Her name is Lina. She is 11 years old. She lives in a swamp. She has a long tail and she can run. Is she _? Yes!', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'fill', 'Imagen de una lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra un lagarto.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'omnivorous', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'carnivorous', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'herbivorous', 'Incorrecto.', FALSE);

    INSERT INTO question_group (id_team_name) VALUES (3) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 19, 'An alligator is lost. His _ is Aldo.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'fill', 'Imagen de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'name', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'age', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'color', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 20, 'An alligator is lost. His name is Aldo. He _ 5 years old.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'fill', 'Imagen de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'is', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'are', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'am', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 21, 'An alligator is lost. His name is Aldo. He is 5 years old. He lives in a _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'fill', 'Imagen de un caimán en un río', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán en un río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'river', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'coast', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'swamp', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 22, 'An alligator is lost. His name is Aldo. He is 5 years old. He lives in a river. He has sharp _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'fill', 'Imagen de un caimán con garras afiladas', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán con garras afiladas.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'claws', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'tail', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'legs', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 23, 'An alligator is lost. His name is Aldo. He is 5 years old. He lives in a river. He has sharp claws, so he can _ and jump.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'fill', 'Imagen de un caimán escondido en el agua', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán escondido en el agua.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'hide', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'swim', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'run', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 25, 'An alligator is lost. His name is Aldo. He is 5 years old. He lives in a river. He has sharp claws, so he can _ and jump. Is he _? Yes!', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'fill', 'Imagen de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'carnivorous', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'herbivorous', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'omnivorous', 'Incorrecto.', FALSE);

    INSERT INTO question_group (id_team_name) VALUES (4) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 13, 'A manatee is lost. Her _ is Molly.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'fill', 'Imagen de una manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'name', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'age', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'color', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 14, 'A manatee is lost. Her name is Molly. She _ 15 years old.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'fill', 'Imagen de una manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'is', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'are', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'am', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 15, 'A manatee is lost. Her name is Molly. She is 15 years old. She lives in the _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'fill', 'Imagen de una manatí en el océano', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí en el océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'ocean', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'river', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'lake', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 16, 'A manatee is lost. Her name is Molly. She is 15 years old. She lives in the ocean. She has big _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'fill', 'Imagen de una manatí con dientes grandes', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí con dientes grandes.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'teeth', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'eyes', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'ears', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 17, 'A manatee is lost. Her name is Molly. She is 15 years old. She lives in the ocean. She has big teeth and she can _.', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'fill', 'Imagen de una manatí nadando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí nadando.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'swim', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'fly', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'walk', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (9, last_question_group_id, 18, 'A manatee is lost. Her name is Molly. She is 15 years old. She lives in the ocean. She has big teeth and she can swim. Is she _? Yes!', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'fill', 'Imagen de una manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'herbivorous', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'carnivorous', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'omnivorous', 'Incorrecto.', FALSE);

    -- questions from task 4
    
    -- pretask 4
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 1, 'Where _ Otto the osprey live?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'fill', 'Imagen de un águila pescadora en su hábitat', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/osprey_mangrove_1.jpg', 'vocabulary', NULL, 'La imagen muestra un águila pescadora en su hábitat.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'does', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'do', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'is', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 2, 'Where does Molly the manatee _?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'fill', 'Imagen de una manatí en su hábitat', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/manatee_mangrove_1.jpg', 'vocabulary', NULL, 'La imagen muestra una manatí en su hábitat.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'live', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'lives', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'is', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 3, 'Where _ Lina the lizard live?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'fill', 'Imagen de una lagarto en su hábitat', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/lizard_mangrove_1.jpg', 'vocabulary', NULL, 'La imagen muestra una lagarto en su hábitat.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'does', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'lives', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'live', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 4, 'Where does Aldo the alligator _?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'fill', 'Imagen de un caimán en su hábitat', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/alligator_mangrove_1.jpg', 'vocabulary', NULL, 'La imagen muestra un caimán en su hábitat.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'live', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'do', 'Incorrecto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'does', 'Incorrecto.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 5, 'How does Otto look like?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora con grandes alas', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/osprey_wings_1.jpg', 'vocabulary', NULL, 'La imagen muestra un águila pescadora con grandes alas.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has big wings', '¡Muy bien! La conjugación en tercera persona del singular del verbo "to have" es "has".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He have big wings', '¡Uy!, no es correcto. La conjugación en tercera persona del singular del verbo "to have" es "has".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has wings big', '¡Uy!, no es correcto. Los adjetivos en inglés se escriben antes del sustantivo.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 6, 'How does Lina look like?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de una lagarto con cola larga', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/lizard_tail_1.jpg', 'vocabulary', NULL, 'La imagen muestra una lagarto con cola larga.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has a long tail', '¡Muy bien! La conjugación en tercera persona del singular del verbo "to have" es "has".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She have a long tail', '¡Uy!, no es correcto. La conjugación en tercera persona del singular del verbo "to have" es "has".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has tail long', '¡Uy!, no es correcto. Los adjetivos en inglés se escriben antes del sustantivo.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 7, 'How does Aldo look like?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán con garras afiladas', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/alligator_claws_1.jpg', 'vocabulary', NULL, 'La imagen muestra un caimán con garras afiladas.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has sharp claws', '¡Muy bien! La conjugación en tercera persona del singular del verbo "to have" es "has".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He have sharp claws', '¡Uy!, no es correcto. La conjugación en tercera persona del singular del verbo "to have" es "has".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has claws sharp', '¡Uy!, no es correcto. Los adjetivos en inglés se escriben antes del sustantivo.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 8, 'How does Molly look like?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de una manatí con grandes dientes', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/manatee_teeth_1.jpg', 'vocabulary', NULL, 'La imagen muestra una manatí con grandes dientes.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has big teeth', '¡Muy bien! La conjugación en tercera persona del singular del verbo "to have" es "has".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She have big teeth', '¡Uy!, no es correcto. La conjugación en tercera persona del singular del verbo "to have" es "has".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has teeth big', '¡Uy!, no es correcto. Los adjetivos en inglés se escriben antes del sustantivo.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 9, 'What does Aldo eat?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán comiendo carne', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/alligator_eat_1.jpg', 'vocabulary', NULL, 'La imagen muestra un caimán comiendo carne.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats meat', '¡Muy bien! La conjugación en tercera persona del singular del verbo "to eat" es "eats".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats algae', '¡Uy!, no es correcto. Los caimanes comen carne, no algas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats insects', '¡Uy!, no es correcto. Los caimanes comen carne, no insectos.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 10, 'What does Molly eat?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de una manatí comiendo algas', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/manatee_eat_1.jpg', 'vocabulary', NULL, 'La imagen muestra una manatí comiendo algas.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats algae', '¡Muy bien! La conjugación en tercera persona del singular del verbo "to eat" es "eats".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats insects', '¡Uy!, no es correcto. Las manatíes comen algas, no insectos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats meat', '¡Uy!, no es correcto. Las manatíes comen algas, no carne.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 11, 'What does Lina eat?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de una lagarto comiendo insectos', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/lizard_eat_1.jpg', 'vocabulary', NULL, 'La imagen muestra una lagarto comiendo insectos.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats insects', '¡Muy bien! La conjugación en tercera persona del singular del verbo "to eat" es "eats".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats algae', '¡Uy!, no es correcto. Las lagartos comen insectos, no algas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats fish', '¡Uy!, no es correcto. Las lagartos comen insectos, no peces.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (10, NULL, 12, 'What does Otto eat?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora comiendo peces', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/osprey_eat_1.jpg', 'vocabulary', NULL, 'La imagen muestra un águila pescadora comiendo peces.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats fish', '¡Muy bien! La conjugación en tercera persona del singular del verbo "to eat" es "eats".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats insects', '¡Uy!, no es correcto. Los águilas pescadoras comen peces, no insectos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats algae', '¡Uy!, no es correcto. Los águilas pescadoras comen peces, no algas.', FALSE);

    -- duringtask 4

    UPDATE task_stage SET mechanics = '{"hidden_question"}' WHERE id_task_stage = 11;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 1, '{Where|Dónde} does Otto the {osprey|águila pescadora} [live|vivir]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora en manglares', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/osprey_mangrove_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora en manglares.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the mangroves', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has big wings', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en manglares.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats fish', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en manglares.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the swamp', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en manglares.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the ocean', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en manglares.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 2, '{Where|Dónde} does Aldo the {alligator|caimán} [live|vivir]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán en un río', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/alligator_river_1.jpg', NULL, NULL, 'La imagen muestra un caimán en un río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the river', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats meat', '¡Uy!, no es correcto. La imagen muestra un caimán en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has sharp claws', '¡Uy!, no es correcto. La imagen muestra un caimán en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the swamp', '¡Uy!, no es correcto. La imagen muestra un caimán en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the bridge', '¡Uy!, no es correcto. La imagen muestra un caimán en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 3, '{Where|Dónde} does Lina the {lizard|lagarto} [live|vivir]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de una lagarto en un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/lizard_swamp_1.jpg', NULL, NULL, 'La imagen muestra una lagarto en un pantano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the swamp', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has a long tail', '¡Uy!, no es correcto. La imagen muestra una lagarto en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats insects', '¡Uy!, no es correcto. La imagen muestra una lagarto en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the river', '¡Uy!, no es correcto. La imagen muestra una lagarto en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the tree', '¡Uy!, no es correcto. La imagen muestra una lagarto en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 4, '{Where|Dónde} does Molly the {manatee|manatí} [live|vivir]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de una manatí en un océano', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/manatee_ocean_1.jpg', NULL, NULL, 'La imagen muestra una manatí en un océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the ocean', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats algae', '¡Uy!, no es correcto. La imagen muestra una manatí en un océano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has big teeth', '¡Uy!, no es correcto. La imagen muestra una manatí en un océano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the river', '¡Uy!, no es correcto. La imagen muestra una manatí en un océano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the swamp', '¡Uy!, no es correcto. La imagen muestra una manatí en un océano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 5, '{How|Cómo} does Otto [look like|se ve]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora con grandes alas', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/osprey_wings_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora con grandes alas.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has big wings', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats fish', '¡Uy!, no es correcto. La imagen muestra un águila pescadora con grandes alas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the mangroves', '¡Uy!, no es correcto. La imagen muestra un águila pescadora con grandes alas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has sharp claws', '¡Uy!, no es correcto. La imagen muestra un águila pescadora con grandes alas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has a long tail', '¡Uy!, no es correcto. La imagen muestra un águila pescadora con grandes alas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 6, '{How|Cómo} does Aldo [look like|se ve]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán con garras afiladas', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/alligator_claws_1.jpg', NULL, NULL, 'La imagen muestra un caimán con garras afiladas.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has sharp claws', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats meat', '¡Uy!, no es correcto. La imagen muestra un caimán con garras afiladas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the river', '¡Uy!, no es correcto. La imagen muestra un caimán con garras afiladas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has big teeth', '¡Uy!, no es correcto. La imagen muestra un caimán con garras afiladas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He has big wings', '¡Uy!, no es correcto. La imagen muestra un caimán con garras afiladas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 7, '{How|Cómo} does Lina [look like|se ve]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de una lagarto con una cola larga', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/lizard_tail_1.jpg', NULL, NULL, 'La imagen muestra una lagarto con una cola larga.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has a long tail', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats insects', '¡Uy!, no es correcto. La imagen muestra una lagarto con una cola larga.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the swamp', '¡Uy!, no es correcto. La imagen muestra una lagarto con una cola larga.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has big teeth', '¡Uy!, no es correcto. La imagen muestra una lagarto con una cola larga.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has sharp claws', '¡Uy!, no es correcto. La imagen muestra una lagarto con una cola larga.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 8, '{How|Cómo} does Molly [look like|se ve]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de una manatí con grandes dientes', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/manatee_teeth_1.jpg', NULL, NULL, 'La imagen muestra una manatí con grandes dientes.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has big teeth', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats algae', '¡Uy!, no es correcto. La imagen muestra una manatí con grandes dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the ocean', '¡Uy!, no es correcto. La imagen muestra una manatí con grandes dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has sharp claws', '¡Uy!, no es correcto. La imagen muestra una manatí con grandes dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She has a long tail', '¡Uy!, no es correcto. La imagen muestra una manatí con grandes dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 9, '{What|Qué} does Otto [eat|come]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora comiendo peces', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/osprey_eat_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora comiendo peces.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats fish', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats insects', '¡Uy!, no es correcto. La imagen muestra un águila pescadora comiendo peces.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats algae', '¡Uy!, no es correcto. La imagen muestra un águila pescadora comiendo peces.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the mangroves', '¡Uy!, no es correcto. La imagen muestra un águila pescadora comiendo peces.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the swamp', '¡Uy!, no es correcto. La imagen muestra un águila pescadora comiendo peces.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 10, '{What|Qué} does Aldo [eat|come]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán comiendo carne', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/alligator_eat_1.jpg', NULL, NULL, 'La imagen muestra un caimán comiendo carne.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats meat', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats algae', '¡Uy!, no es correcto. La imagen muestra un caimán comiendo carne.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He eats insects', '¡Uy!, no es correcto. La imagen muestra un caimán comiendo carne.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the river', '¡Uy!, no es correcto. La imagen muestra un caimán comiendo carne.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'He lives in the swamp', '¡Uy!, no es correcto. La imagen muestra un caimán comiendo carne.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 11, '{What|Qué} does Lina [eat|come]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'select', 'Imagen de una lagarto comiendo insectos', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/lizard_eat_1.jpg', NULL, NULL, 'La imagen muestra una lagarto comiendo insectos.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats insects', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats meat', '¡Uy!, no es correcto. La imagen muestra una lagarto comiendo insectos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats fish', '¡Uy!, no es correcto. La imagen muestra una lagarto comiendo insectos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the mangroves', '¡Uy!, no es correcto. La imagen muestra una lagarto comiendo insectos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the ocean', '¡Uy!, no es correcto. La imagen muestra una lagarto comiendo insectos.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (11, NULL, 12, '{What|Qué} does Molly [eat|come]?', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'select', 'Imagen de una manatí comiendo algas', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/manatee_eat_1.jpg', NULL, NULL, 'La imagen muestra una manatí comiendo algas.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats algae', '¡Muy bien!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats insects', '¡Uy!, no es correcto. La imagen muestra una manatí comiendo algas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She eats meat', '¡Uy!, no es correcto. La imagen muestra una manatí comiendo algas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the ocean', '¡Uy!, no es correcto. La imagen muestra una manatí comiendo algas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'She lives in the swamp', '¡Uy!, no es correcto. La imagen muestra una manatí comiendo algas.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '/HIDDEN QUESTION/', '', FALSE);
    
    -- postask 4
    
    UPDATE task_stage SET mechanics = '{"question_group-random"}' WHERE id_task_stage = 12;

    INSERT INTO question_group (id_team_name) VALUES (1) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (12, last_question_group_id, 1, 'Tell us information about the osprey', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/osprey_1.mp3', NULL, 'open', NULL, NULL, NULL, 'chucho', 'The osprey lives in _. It''s name is _. It eats _.', 'en') RETURNING id_question INTO last_question_id;

    INSERT INTO question_group (id_team_name) VALUES (2) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (12, last_question_group_id, 2, 'Tell us information about the lizard', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/lizard_1.mp3', NULL, 'open', NULL, NULL, NULL, 'chucho', 'The lizard lives in _. It''s name is _. It eats _.', 'en') RETURNING id_question INTO last_question_id;

    INSERT INTO question_group (id_team_name) VALUES (3) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (12, last_question_group_id, 3, 'Tell us information about the alligator', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/alligator_1.mp3', NULL, 'open', NULL, NULL, NULL, 'chucho', 'The alligator lives in _. It''s name is _. It eats _.', 'en') RETURNING id_question INTO last_question_id;

    INSERT INTO question_group (id_team_name) VALUES (4) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (12, last_question_group_id, 4, 'Tell us information about the manaatee', 'https://storage.googleapis.com/eyeland-0/app/content/shared/audio/manatee_1.mp3', NULL, 'open', NULL, NULL, NULL, 'chucho', 'The manatee lives in _. It''s name is _. It eats _.', 'en') RETURNING id_question INTO last_question_id;

    -- questions from task 5
    
    -- pretask 5
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (13, NULL, 1, 'What types of plants are there in the ocean?', NULL, NULL, 'select', 'Imagen de pastos marinos y algas en el océano', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/seagrass_algae_ocean_1.jpg', 'vocabulary', NULL, 'La imagen muestra pastos marinos y algas en el océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'There are seagrasses and algae', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'There are red and white mangroves', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (13, NULL, 2, 'What types of plants are there in the river?', NULL, NULL, 'select', 'Imagen de árboles de acacia en el río', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/acacia_river_1.jpg', 'vocabulary', NULL, 'La imagen muestra árboles de acacia en el río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'There is acacia tree', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'There are red and white mangroves', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (13, NULL, 3, 'What types of plants are there in the swamp?', NULL, NULL, 'select', 'Imagen de manglares rojos y blancos en un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangrove_red_white_swamp_1.jpg', 'vocabulary', NULL, 'La imagen muestra manglares rojos y blancos en un pantano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'There are red and white mangroves', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'There are cacti', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (13, NULL, 4, 'What types of plants are there in the natural park?', NULL, NULL, 'select', 'Imagen de juncos en el parque natural', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/rush_natural_park_1.jpg', 'vocabulary', NULL, 'La imagen muestra juncos en el parque natural.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'There are rushes', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'There are pines', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (13, NULL, 5, 'What types of animales are there in the mangroves?', NULL, NULL, 'select', 'Imagen de pelícanos pardos en un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/pelican_mangrove_1.jpg', 'vocabulary', NULL, 'La imagen muestra pelícanos pardos en un manglar.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Brown pelicans', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Sea bass', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (13, NULL, 6, 'What types of animales are there in the ocean?', NULL, NULL, 'select', 'Imagen de un róbalo en el océano', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sea_bass_ocean_1.jpg', 'vocabulary', NULL, 'La imagen muestra un róbalo en el océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Sea bass', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mosquito', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (13, NULL, 7, 'What types of animales are there in the swamp?', NULL, NULL, 'select', 'Imagen de una tortuga verde en un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/green_turtle_swamp_1.jpg', 'vocabulary', NULL, 'La imagen muestra una tortuga verde en un pantano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Green turtle', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Raccoon', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (13, NULL, 8, 'What types of animales are there in the river?', NULL, NULL, 'select', 'Imagen de un pato negro en un río', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/duck_river_1.jpg', 'vocabulary', NULL, 'La imagen muestra un pato negro en un río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Black duck', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Seagull', 'Incorrecto.', FALSE);

    -- duringtask 5

    UPDATE task_stage SET mechanics = '{"form_image"}' WHERE id_task_stage = 14;

    INSERT INTO question_group (id_team_name) VALUES (NULL) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 1, 'What types of habitats are there in Salamanca natural park?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione un hábitat propio del parque Isla Salamanca.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'River', '¡Excelente!', TRUE, 'Imagen de un hábitat de río', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/river/river_1.jpg', 'Imagen de un hábitat de río', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/river_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Tundra', 'Incorrecto.', FALSE, 'Imagen de un hábitat de tundra', NULL, 'Imagen de un hábitat de tundra', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/tundra_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Taiga', 'Incorrecto.', FALSE, 'Imagen de un hábitat de taiga', NULL, 'Imagen de un hábitat de taiga', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/taiga_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Desert', 'Incorrecto.', FALSE, 'Imagen de un hábitat de desierto', NULL, 'Imagen de un hábitat de desierto', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/desert_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Savannah', 'Incorrecto.', FALSE, 'Imagen de un hábitat de sabana', NULL, 'Imagen de un hábitat de sabana', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/savannah_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Forest', 'Incorrecto.', FALSE, 'Imagen de un hábitat de bosque', NULL, 'Imagen de un hábitat de bosque', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/forest_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 2, 'What animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales que viven en el río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Manatees', '¡Excelente!', TRUE, 'Imagen de manatíes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/river/manatees_1.png', 'Imagen de manatíes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/manatees_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ospreys', 'Incorrecto.', FALSE, 'Imagen de águilas pescadoras', NULL, 'Imagen de águilas pescadoras', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ospreys_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Raccoons', 'Incorrecto.', FALSE, 'Imagen de mapaches', NULL, 'Imagen de mapaches', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/raccoons_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Foxes', 'Incorrecto.', FALSE, 'Imagen de zorros', NULL, 'Imagen de zorros', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/foxes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Elephants', 'Incorrecto.', FALSE, 'Imagen de elefantes', NULL, 'Imagen de elefantes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/elephants_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ocelots', 'Incorrecto.', FALSE, 'Imagen de ocelotes', NULL, 'Imagen de ocelotes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocelots_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 3, 'What plants are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione las plantas que viven en el río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Rushes', '¡Excelente!', TRUE, 'Imagen de juncos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/river/rushes_1.png', 'Imagen de juncos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/rushes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Acacia trees', 'Incorrecto.', FALSE, 'Imagen de árboles de acacia', NULL, 'Imagen de árboles de acacia', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/acacia_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Palms', 'Incorrecto.', FALSE, 'Imagen de palmas', NULL, 'Imagen de palmas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/palms_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Seagrass', 'Incorrecto.', FALSE, 'Imagen de pastos marinos', NULL, 'Imagen de pastos marinos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/seagrass_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Cacti', 'Incorrecto.', FALSE, 'Imagen de cactus', NULL, 'Imagen de cactus', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/cacti_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Pines', 'Incorrecto.', FALSE, 'Imagen de pinos', NULL, 'Imagen de pinos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/pines_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 4, 'What types of mangroves are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los tipos de manglares que hay en el río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Red mangroves', '¡Excelente!', TRUE, 'Imagen de manglares rojos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/river/mangroves_red_1.png', 'Imagen de manglares rojos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_red_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Black mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares negros', NULL, 'Imagen de manglares negros', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_black_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'White mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares blancos', NULL, 'Imagen de manglares blancos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_white_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Grey mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares grises', NULL, 'Imagen de manglares grises', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_grey_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Buttonwood mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares botoncillo', NULL, 'Imagen de manglares botoncillo', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_buttonwood_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Green mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares verdes', NULL, 'Imagen de manglares verdes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_green_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 5, 'What carnivorous animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales carnívoros que viven en el río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Alligators', '¡Excelente!', TRUE, 'Imagen de caimanes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/river/alligators_1.png', 'Imagen de caimanes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/alligators_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Lions', 'Incorrecto.', FALSE, 'Imagen de leones', NULL, 'Imagen de leones', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/lions_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Polar bears', 'Incorrecto.', FALSE, 'Imagen de osos polares', NULL, 'Imagen de osos polares', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/polar_bears_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ocelots', 'Incorrecto.', FALSE, 'Imagen de ocelotes', NULL, 'Imagen de ocelotes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocelots_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sharks', 'Incorrecto.', FALSE, 'Imagen de tiburones', NULL, 'Imagen de tiburones', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sharks_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Tigers', 'Incorrecto.', FALSE, 'Imagen de tigres', NULL, 'Imagen de tigres', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/tigers_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 6, 'What omnivorous animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales omnívoros que viven en el río.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ducks', '¡Excelente!', TRUE, 'Imagen de patos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/river/ducks_1.png', 'Imagen de patos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ducks_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Bears', 'Incorrecto.', FALSE, 'Imagen de osos', NULL, 'Imagen de osos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/bears_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Owls', 'Incorrecto.', FALSE, 'Imagen de búhos', NULL, 'Imagen de búhos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/owls_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ocelots', 'Incorrecto.', FALSE, 'Imagen de ocelotes', NULL, 'Imagen de ocelotes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/owls_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Lizards', 'Incorrecto.', FALSE, 'Imagen de lagartos', NULL, 'Imagen de lagartos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/lizards_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Manatees', 'Incorrecto.', FALSE, 'Imagen de manatíes', NULL, 'Imagen de manatíes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/manatees_prev_1.jpg');

    INSERT INTO question_group (id_team_name) VALUES (NULL) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 7, 'What types of habitats are there in Salamanca natural park?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione un hábitat propio del parque Isla Salamanca.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Swamp', '¡Excelente!', TRUE, 'Imagen de un hábitat de pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/swamp/swamp_1.jpg', 'Imagen de un hábitat de pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/swamp_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Tundra', 'Incorrecto.', FALSE, 'Imagen de un hábitat de tundra', NULL, 'Imagen de un hábitat de tundra', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/tundra_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Taiga', 'Incorrecto.', FALSE, 'Imagen de un hábitat de taiga', NULL, 'Imagen de un hábitat de taiga', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/taiga_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Desert', 'Incorrecto.', FALSE, 'Imagen de un hábitat de desierto', NULL, 'Imagen de un hábitat de desierto', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/desert_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Savannah', 'Incorrecto.', FALSE, 'Imagen de un hábitat de sabana', NULL, 'Imagen de un hábitat de sabana', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/savannah_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Forest', 'Incorrecto.', FALSE, 'Imagen de un hábitat de bosque', NULL, 'Imagen de un hábitat de bosque', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/forest_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 8, 'What animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales que viven en los pantanos.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Lizards', '¡Excelente!', TRUE, 'Imagen de lagartos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/swamp/lizards_1.png', 'Imagen de lagartos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/lizards_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Seagulls', 'Incorrecto.', FALSE, 'Imagen de gaviotas', NULL, 'Imagen de gaviotas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/seagulls_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Polar bears', 'Incorrecto.', FALSE, 'Imagen de osos polares', NULL, 'Imagen de osos polares', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/polar_bears_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Giraffes', 'Incorrecto.', FALSE, 'Imagen de jirafas', NULL, 'Imagen de jirafas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/giraffes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Tigers', 'Incorrecto.', FALSE, 'Imagen de tigres', NULL, 'Imagen de tigres', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/tigers_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Herons', 'Incorrecto.', FALSE, 'Imagen de garzas', NULL, 'Imagen de garzas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/herons_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 9, 'What plants are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione las plantas que viven en los pantanos.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Water lilies', '¡Excelente!', TRUE, 'Imagen de nenúfares', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/swamp/water_lilies_1.png', 'Imagen de nenúfares', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/water_lilies_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sunflowers', 'Incorrecto.', FALSE, 'Imagen de girasoles', NULL, 'Imagen de girasoles', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sunflowers_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Rushes', 'Incorrecto.', FALSE, 'Imagen de juncos', NULL, 'Imagen de juncos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/rushes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Bamboo', 'Incorrecto.', FALSE, 'Imagen de bamboo', NULL, 'Imagen de bamboo', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/bamboo_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Dandelions', 'Incorrecto.', FALSE, 'Imagen de dientes de león', NULL, 'Imagen de dientes de león', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/dandelions_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Pines', 'Incorrecto.', FALSE, 'Imagen de pinos', NULL, 'Imagen de pinos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/pines_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 10, 'What types of mangroves are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los tipos de manglares que hay en los pantanos.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Red mangroves', '¡Excelente!', TRUE, 'Imagen de manglares rojos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/swamp/mangroves_red_1.png', 'Imagen de manglares rojos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_red_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Black mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares negros', NULL, 'Imagen de manglares negros', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_black_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'White mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares blancos', NULL, 'Imagen de manglares blancos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_white_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Grey mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares grises', NULL, 'Imagen de manglares grises', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_grey_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Buttonwood mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares botoncillo', NULL, 'Imagen de manglares botoncillo', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_buttonwood_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Green mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares verdes', NULL, 'Imagen de manglares verdes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_green_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 11, 'What carnivorous animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales carnívoros que viven en los pantanos.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Snakes', '¡Excelente!', TRUE, 'Imagen de serpientes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/swamp/snakes_1.png', 'Imagen de serpientes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/snakes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ducks', 'Incorrecto.', FALSE, 'Imagen de patos', NULL, 'Imagen de patos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ducks_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Hummingbirds', 'Incorrecto.', FALSE, 'Imagen de colibríes', NULL, 'Imagen de colibríes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/hummingbirds_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Common opossums', 'Incorrecto.', FALSE, 'Imagen de zorrochuchos', NULL, 'Imagen de zorrochuchos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/common_opossums_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Camels', 'Incorrecto.', FALSE, 'Imagen de camellos', NULL, 'Imagen de camellos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/camels_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Box turtles', 'Incorrecto.', FALSE, 'Imagen de tortugas', NULL, 'Imagen de tortugas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/box_turtles_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 12, 'What omnivorous animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales omnívoros que viven en los pantanos.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Box turtles', '¡Excelente!', TRUE, 'Imagen de tortugas de caja', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/swamp/box_turtles_1.png', 'Imagen de tortugas de caja', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/box_turtles_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Pigs', 'Incorrecto.', FALSE, 'Imagen de cerdos', NULL, 'Imagen de cerdos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/pigs_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Wolves', 'Incorrecto.', FALSE, 'Imagen de lobos', NULL, 'Imagen de lobos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/wolves_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Penguins', 'Incorrecto.', FALSE, 'Imagen de pingüinos', NULL, 'Imagen de pingüinos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/penguins_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ospreys', 'Incorrecto.', FALSE, 'Imagen de águilas pescadoras', NULL, 'Imagen de águilas pescadoras', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ospreys_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Manatees', 'Incorrecto.', FALSE, 'Imagen de manatíes', NULL, 'Imagen de manatíes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/manatees_prev_1.jpg');

    INSERT INTO question_group (id_team_name) VALUES (NULL) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 13, 'What types of habitats are there in Salamanca natural park?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione un hábitat propio del parque Isla Salamanca.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Mangroves', '¡Excelente!', TRUE, 'Imagen de un hábitat de manglares', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangrove/mangrove_1.jpg', 'Imagen de un hábitat de manglares', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangrove_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Tundra', 'Incorrecto.', FALSE, 'Imagen de un hábitat de tundra', NULL, 'Imagen de un hábitat de tundra', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/tundra_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Taiga', 'Incorrecto.', FALSE, 'Imagen de un hábitat de taiga', NULL, 'Imagen de un hábitat de taiga', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/taiga_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Desert', 'Incorrecto.', FALSE, 'Imagen de un hábitat de desierto', NULL, 'Imagen de un hábitat de desierto', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/desert_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Savannah', 'Incorrecto.', FALSE, 'Imagen de un hábitat de sabana', NULL, 'Imagen de un hábitat de sabana', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/savannah_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Forest', 'Incorrecto.', FALSE, 'Imagen de un hábitat de bosque', NULL, 'Imagen de un hábitat de bosque', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/forest_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 14, 'What animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales que viven en los manglares.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Heron', '¡Excelente!', TRUE, 'Imagen de garzas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangrove/herons_1.png', 'Imagen de garzas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/herons_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sharks', 'Incorrecto.', FALSE, 'Imagen de tiburones', NULL, 'Imagen de tiburones', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sharks_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Pigs', 'Incorrecto.', FALSE, 'Imagen de cerdos', NULL, 'Imagen de cerdos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/pigs_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Foxes', 'Incorrecto.', FALSE, 'Imagen de zorros', NULL, 'Imagen de zorros', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/foxes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Giraffes', 'Incorrecto.', FALSE, 'Imagen de jirafas', NULL, 'Imagen de jirafas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/giraffes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Chicken', 'Incorrecto.', FALSE, 'Imagen de pollos', NULL, 'Imagen de pollos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/chicken_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 15, 'What plants are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione las plantas que viven en los manglares.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Algae', '¡Excelente!', TRUE, 'Imagen de algas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangrove/algae_1.png', 'Imagen de algas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/algae_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sunflowers', 'Incorrecto.', FALSE, 'Imagen de girasoles', NULL, 'Imagen de girasoles', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sunflowers_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Palms', 'Incorrecto.', FALSE, 'Imagen de palmas', NULL, 'Imagen de palmas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/palms_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Seagrass', 'Incorrecto.', FALSE, 'Imagen de pastos marinos', NULL, 'Imagen de pastos marinos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/seagrass_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Cacti', 'Incorrecto.', FALSE, 'Imagen de cactus', NULL, 'Imagen de cactus', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/cacti_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Corn', 'Incorrecto.', FALSE, 'Imagen de maíz', NULL, 'Imagen de maíz', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/corn_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 16, 'What types of mangroves are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los tipos de manglares que hay en los manglares.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Red mangroves', '¡Excelente!', TRUE, 'Imagen de manglares rojos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangrove/mangroves_red_1.png', 'Imagen de manglares rojos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_red_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Black mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares negros', NULL, 'Imagen de manglares negros', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_black_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'White mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares blancos', NULL, 'Imagen de manglares blancos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_white_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Grey mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares grises', NULL, 'Imagen de manglares grises', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_grey_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Buttonwood mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares botoncillo', NULL, 'Imagen de manglares botoncillo', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_buttonwood_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Green mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares verdes', NULL, 'Imagen de manglares verdes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_green_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 17, 'What carnivorous animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales carnívoros que viven en los manglares.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ocelots', '¡Excelente!', TRUE, 'Imagen de ocelotes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangrove/ocelots_1.png', 'Imagen de ocelotes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocelots_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Lions', 'Incorrecto.', FALSE, 'Imagen de leones', NULL, 'Imagen de leones', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/lions_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Rhinos', 'Incorrecto.', FALSE, 'Imagen de rinocerontes', NULL, 'Imagen de rinocerontes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/rhinos_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Hawks', 'Incorrecto.', FALSE, 'Imagen de halcones', NULL, 'Imagen de halcones', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/hawks_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sharks', 'Incorrecto.', FALSE, 'Imagen de tiburones', NULL, 'Imagen de tiburones', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sharks_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Tigers', 'Incorrecto.', FALSE, 'Imagen de tigres', NULL, 'Imagen de tigres', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/tigers_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 18, 'What omnivorous animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales omnívoros que viven en los manglares.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Raccoons', '¡Excelente!', TRUE, 'Imagen de mapaches', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangrove/raccoons_1.png', 'Imagen de mapaches', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/raccoons_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Snakes', 'Incorrecto.', FALSE, 'Imagen de serpientes', NULL, 'Imagen de serpientes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/snakes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Pelicans', 'Incorrecto.', FALSE, 'Imagen de pelícanos', NULL, 'Imagen de pelícanos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/pelicans_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Dogs', 'Incorrecto.', FALSE, 'Imagen de perros', NULL, 'Imagen de perros', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/dogs_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Otters', 'Incorrecto.', FALSE, 'Imagen de lagartos', NULL, 'Imagen de lagartos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/otters_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Manatees', 'Incorrecto.', FALSE, 'Imagen de manatíes', NULL, 'Imagen de manatíes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/manatees_prev_1.jpg');

    INSERT INTO question_group (id_team_name) VALUES (NULL) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 19, 'What types of habitats are there in Salamanca natural park?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione un hábitat propio del parque Isla Salamanca.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ocean', '¡Excelente!', TRUE, 'Imagen de un hábitat de océano', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocean/ocean_1.jpg', 'Imagen de un hábitat de océano', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocean_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Tundra', 'Incorrecto.', FALSE, 'Imagen de un hábitat de tundra', NULL, 'Imagen de un hábitat de tundra', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/tundra_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Taiga', 'Incorrecto.', FALSE, 'Imagen de un hábitat de taiga', NULL, 'Imagen de un hábitat de taiga', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/taiga_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Desert', 'Incorrecto.', FALSE, 'Imagen de un hábitat de desierto', NULL, 'Imagen de un hábitat de desierto', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/desert_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Savannah', 'Incorrecto.', FALSE, 'Imagen de un hábitat de sabana', NULL, 'Imagen de un hábitat de sabana', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/savannah_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Forest', 'Incorrecto.', FALSE, 'Imagen de un hábitat de bosque', NULL, 'Imagen de un hábitat de bosque', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/forest_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 20, 'What animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales que viven en el océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sea basses', '¡Excelente!', TRUE, 'Imagen de róbalos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocean/sea_basses_1.png', 'Imagen de róbalos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sea_basses_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Alligators', 'Incorrecto.', FALSE, 'Imagen de caimanes', NULL, 'Imagen de caimanes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/alligators_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Catfish', 'Incorrecto.', FALSE, 'Imagen de mapaches', NULL, 'Imagen de mapaches', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/catfishes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Axolotls', 'Incorrecto.', FALSE, 'Imagen de zorros', NULL, 'Imagen de zorros', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/axolotls_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Otters', 'Incorrecto.', FALSE, 'Imagen de nutrias', NULL, 'Imagen de nutrias', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/otters_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Lizards', 'Incorrecto.', FALSE, 'Imagen de lagartos', NULL, 'Imagen de lagartos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/lizards_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 21, 'What plants are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione las plantas que viven en el océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Seagrass', '¡Excelente!', TRUE, 'Imagen de pastos marinos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocean/seagrasses_1.png', 'Imagen de pastos marinos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/seagrasses_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Water lilies', 'Incorrecto.', FALSE, 'Imagen de nenúfares', NULL, 'Imagen de nenúfares', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/water_lilies_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Palms', 'Incorrecto.', FALSE, 'Imagen de palmas', NULL, 'Imagen de palmas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/palms_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Bamboo', 'Incorrecto.', FALSE, 'Imagen de bamboo', NULL, 'Imagen de bamboo', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/bamboo_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Cacti', 'Incorrecto.', FALSE, 'Imagen de cactus', NULL, 'Imagen de cactus', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/cacti_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Dandelions', 'Incorrecto.', FALSE, 'Imagen de dientes de león', NULL, 'Imagen de dientes de león', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/dandelions_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 22, 'What types of mangroves are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los tipos de manglares que hay en el océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Red mangroves', '¡Excelente!', TRUE, 'Imagen de manglares rojos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocean/mangroves_red_1.png', 'Imagen de manglares rojos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_red_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Black mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares negros', NULL, 'Imagen de manglares negros', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_black_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'White mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares blancos', NULL, 'Imagen de manglares blancos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_white_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Grey mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares grises', NULL, 'Imagen de manglares grises', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_grey_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Buttonwood mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares botoncillo', NULL, 'Imagen de manglares botoncillo', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_buttonwood_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Green mangroves', 'Incorrecto.', FALSE, 'Imagen de manglares verdes', NULL, 'Imagen de manglares verdes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/mangroves_green_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 23, 'What carnivorous animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales carnívoros que viven en el océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sharks', '¡Excelente!', TRUE, 'Imagen de tiburones', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocean/sharks_1.png', 'Imagen de tiburones', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sharks_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Snakes', 'Incorrecto.', FALSE, 'Imagen de serpientes', NULL, 'Imagen de serpientes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/snakes_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Box turtles', 'Incorrecto.', FALSE, 'Imagen de tortugas de caja', NULL, 'Imagen de tortugas de caja', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/box_turtles_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sea turtles', 'Incorrecto.', FALSE, 'Imagen de tortugas de mar', NULL, 'Imagen de tortugas de mar', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sea_turtles_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Manatees', 'Incorrecto.', FALSE, 'Imagen de manatíes', NULL, 'Imagen de manatíes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/manatees_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Seahorses', 'Incorrecto.', FALSE, 'Imagen de caballos de mar', NULL, 'Imagen de caballos de mar', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/seahorses_prev_1.jpg');
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (14, last_question_group_id, 24, 'What omnivorous animals are there?', NULL, NULL, 'form_image', NULL, NULL, 'vocabulary', 'alex', 'Seleccione los animales omnívoros que viven en el océano.', 'en') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Sea turtles', '¡Excelente!', TRUE, 'Imagen de tortugas de mar', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ocean/sea_turtles_1.png', 'Imagen de tortugas de mar', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/sea_turtles_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Alligators', 'Incorrecto.', FALSE, 'Imagen de caimanes', NULL, 'Imagen de caimanes', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/alligators_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Ducks', 'Incorrecto.', FALSE, 'Imagen de patos', NULL, 'Imagen de patos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/ducks_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Dolphins', 'Incorrecto.', FALSE, 'Imagen de delfines', NULL, 'Imagen de delfines', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/dolphins_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Lizards', 'Incorrecto.', FALSE, 'Imagen de lagartos', NULL, 'Imagen de lagartos', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/lizards_prev_1.jpg');
    INSERT INTO option (id_question, content, feedback, correct, main_img_alt, main_img_url, preview_img_alt, preview_img_url) VALUES (last_question_id, 'Whales', 'Incorrecto.', FALSE, 'Imagen de ballenas', NULL, 'Imagen de ballenas', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/whales_prev_1.jpg');

    -- postask 5

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint, lang) VALUES (15, NULL, 1, 'Describe Salamanca Island natural park.', NULL, NULL, 'open', NULL, NULL, 'vocabulary', 'alex', 'In Salamanca Island, there is a river, a swamp, an ocean... In the ocean, there are manatees and algae... In the swamp, there are mangroves and rushes.', 'en') RETURNING id_question INTO last_question_id;
    
END $$;

-- *INSERTANDO USUARIOS E INSTITUCIONES DE PRUEBA
-- INSERT INTO institution
INSERT INTO institution (name, nit, address, city, country, phone_code, phone_number, email, website_url) VALUES ('Institución 1', '123456789', 'Cra 45 # 23-67', 'Barranquilla', 'Colombia', '57', '3011231234', 'ied1@test.com', 'https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif');
INSERT INTO institution (name, nit, address, city, country, phone_code, phone_number, email, website_url) VALUES ('Institución Educativa Distrital La Magdalena', '000000000', 'Calle 41 #7-07', 'Barranquilla', 'Colombia', '57', '3008153396', 'info@insedmag.edu.co', 'https://insedmag.edu.co/institucional/');

-- INSERT INTO teacher
INSERT INTO teacher (id_institution, username, password, first_name, last_name, email, phone_code, phone_number) VALUES (1, 'teacher', 'teacher', 'Profesor', 'Prueba', 'teacher1@test.com', '57', '3011231234');
INSERT INTO teacher (id_institution, username, password, first_name, last_name, email, phone_code, phone_number) VALUES (1, 'teacher2', 'teacher2', 'Profesor', 'Prueba', 'teacher2@test.com', '57', '3011231234');
INSERT INTO teacher (id_institution, username, password, first_name, last_name, email, phone_code, phone_number) VALUES (1, 'teacher3', 'teacher3', 'Profesor', 'Prueba', 'teacher3@test.com', '57', '3011231234');
INSERT INTO teacher (id_institution, username, password, first_name, last_name, email, phone_code, phone_number) VALUES (2, 'professor', '123', 'Invitado', 'De Prueba', 'professor@eyeland.com', '57', '3011231234');

-- INSERT INTO course
INSERT INTO course (id_institution, id_teacher, name) VALUES (1, 1, 'Curso 1');
INSERT INTO course (id_institution, id_teacher, name) VALUES (1, 1, 'Curso 2');
INSERT INTO course (id_institution, id_teacher, name) VALUES (1, 2, 'Curso 1');
INSERT INTO course (id_institution, id_teacher, name) VALUES (1, 3, 'Curso 1');
INSERT INTO course (id_institution, id_teacher, name) VALUES (2, 4, 'Noveno');

-- INSERT INTO student
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (1, 'Estudiante1', 'Apellido', 'student1', 'pass123', 'student1@test.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (1, 'Estudiante2', 'Apellido', 'student2', 'pass123', 'student2@test.com', '57', '3001231234', 2, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (1, 'Estudiante3', 'Apellido', 'student3', 'pass123', 'student3@test.com', '57', '3001231234', 3, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (1, 'Estudiante4', 'Apellido', 'student4', 'pass123', 'student4@test.com', '57', '3001231234', 4, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (1, 'Estudiante5', 'Apellido', 'student5', 'pass123', 'student5@test.com', '57', '3001231234', 5, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (1, 'Estudiante6', 'Apellido', 'student6', 'pass123', 'student6@test.com', '57', '3001231234', 6, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (1, 'Estudiante7', 'Apellido', 'student7', 'pass123', 'student7@test.com', '57', '3001231234', 7, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (2, 'Estudiante1', 'Apellido', 'student21', 'pass123', 'student21@test.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (2, 'Estudiante2', 'Apellido', 'student22', 'pass123', 'student22@test.com', '57', '3001231234', 1, 2, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (2, 'Estudiante3', 'Apellido', 'student23', 'pass123', 'student23@test.com', '57', '3001231234', 1, 3, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (2, 'Estudiante4', 'Apellido', 'student24', 'pass123', 'student24@test.com', '57', '3001231234', 1, 4, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (2, 'Estudiante5', 'Apellido', 'student25', 'pass123', 'student25@test.com', '57', '3001231234', 1, 5, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (2, 'Estudiante6', 'Apellido', 'student26', 'pass123', 'student26@test.com', '57', '3001231234', 1, 6, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (2, 'Estudiante7', 'Apellido', 'student27', 'pass123', 'student27@test.com', '57', '3001231234', 1, 7, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (2, 'Estudiante7', 'Apellido', 'student28', 'pass123', 'student28@test.com', '57', '3001231234', 1, 8, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante1', 'Apellido', 'student31', 'pass123', 'student31@test.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante2', 'Apellido', 'student32', 'pass123', 'student32@test.com', '57', '3001231234', 1, 1, 2);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante3', 'Apellido', 'student33', 'pass123', 'student33@test.com', '57', '3001231234', 1, 1, 3);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante4', 'Apellido', 'student34', 'pass123', 'student34@test.com', '57', '3001231234', 1, 1, 4);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante5', 'Apellido', 'student35', 'pass123', 'student35@test.com', '57', '3001231234', 1, 1, 5);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante6', 'Apellido', 'student36', 'pass123', 'student36@test.com', '57', '3001231234', 1, 1, 6);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante7', 'Apellido', 'student37', 'pass123', 'student37@test.com', '57', '3001231234', 1, 1, 7);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante7', 'Apellido', 'student38', 'pass123', 'student38@test.com', '57', '3001231234', 1, 1, 8);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (3, 'Estudiante7', 'Apellido', 'student39', 'pass123', 'student39@test.com', '57', '3001231234', 1, 1, 9);

INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Dreamer', 'Apellido1 Apellido2', 'dreamer', '123', 'student_dreamer@eyeland.com', '57', '3001231234', 3, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Ninja', 'Apellido1 Apellido2', 'ninja', '123', 'student_ninja@eyeland.com', '57', '3001231234', 3, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Wolf', 'Apellido1 Apellido2', 'wolf', '123', 'student_wolf@eyeland.com', '57', '3001231234', 4, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Star', 'Apellido1 Apellido2', 'star', '123', 'student_star@eyeland.com', '57', '3001231234', 7, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Explorer', 'Apellido1 Apellido2', 'explorer', '123', 'student_explorer@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Artist', 'Apellido1 Apellido2', 'artist', '123', 'student_artist@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Leader', 'Apellido1 Apellido2', 'leader', '123', 'student_leader@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Astronaut', 'Apellido1 Apellido2', 'astronaut', '123', 'student_astronaut@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Phoenix', 'Apellido1 Apellido2', 'phoenix', '123', 'student_phoenix@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Sunset', 'Apellido1 Apellido2', 'sunset', '123', 'student_sunset@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Python', 'Apellido1 Apellido2', 'python', '123', 'student_python@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Guide', 'Apellido1 Apellido2', 'guide', '123', 'student_guide@eyeland.com', '57', '3001231234', 1, 1, 1);

INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Fortran', 'Apellido1 Apellido2', 'fortran', '123', 'student_fortran@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Cobol', 'Apellido1 Apellido2', 'cobol', '123', 'student_cobol@eyeland.com', '57', '3001231234', 1, 1, 1);

INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Brunner Hurtador', 'Apellido1 Apellido2', 'brunner', '123', 'student_brunner@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Harry Potter', 'Apellido1 Apellido2', 'not_redo', '123', 'student_not_redo@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Milos', 'Apellido1 Apellido2', 'wilson', '123', 'student_wilson@eyeland.com', '57', '3001231234', 1, 1, 1);
INSERT INTO student (id_course, first_name, last_name, username, password, email, phone_code, phone_number, id_blindness_acuity, id_visual_field_defect, id_color_deficiency) VALUES (5, 'Air-e', 'Apellido1 Apellido2', 'miau', '123', 'student_miau@eyeland.com', '57', '3001231234', 1, 1, 1);

-- INSERT INTO admin
INSERT INTO admin (first_name, last_name, email, username, password) VALUES ('Brunner', 'Hurtador', 'carlbrunner@hurtador.com', 'hurtador', 'cocacola');

-- INSERT INTO release
INSERT INTO release (url, version) VALUES ('https://storage.googleapis.com/eyeland-0/app/dist/v/eyeland-3.5.11.apk', '3.5.11');

-- Unlock all tasks for everybody (development)
UPDATE student_task SET highest_stage = 3;
