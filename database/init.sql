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

CREATE TYPE valid_task_stage_mechanic AS ENUM ('question_group-team_name', 'question_group-duringtask_based');

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

CREATE TYPE valid_question_character AS ENUM ('beto', 'valery', 'alex', 'chucho');
CREATE TYPE valid_question_type AS ENUM ('flashcard', 'fill', 'order', 'select', 'audio_select', 'audio_order', 'audio_speaking', 'select_speaking', 'select&speaking', 'open', 'order-word', 'audio_order-word');
CREATE TYPE valid_question_topic AS ENUM ('vocabulary', 'prepositions', 'personal_presentation');

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

CREATE TYPE valid_power AS ENUM ('super_hearing', 'memory_pro', 'super_radar');

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
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url, thumbnail_alt, coming_soon) VALUES (4, 'Local Culture', 'Descubre la cultura local y las tradiciones de las comunidades que rodean el Parque Isla Salamanca, aprendiendo sobre comida, música, danza y artesanía.', '¡Descubramos la cultura local y las tradiciones de las comunidades que rodean el Parque Isla Salamanca! Aprenderemos a decir hola y cómo estás en inglés, y también aprenderemos sobre la deliciosa comida, la música divertida, el baile colorido y las hermosas artesanías que hacen que este lugar sea especial. ¡Incluso podrás practicar algunas expresiones en inglés y tener una conversación virtual con un amigo local!', '{ "local culture", "traditions", "food", "music", "dance", "crafts", "greetings", "expressions", "social interaction" }', 'https://storage.googleapis.com/eyeland-0/app/content/task_4/thumbnail_1.jpg', 'Imagen de la task', TRUE);
-- Foto de Marcel Kodama: https://www.pexels.com/es-es/foto/bosque-de-bambu-con-hilera-de-arboles-en-un-dia-soleado-3632689/
INSERT INTO task (task_order, name, description, long_description, keywords, thumbnail_url, thumbnail_alt, coming_soon) VALUES (5, 'The Great Challenge', 'Usa todo tu dominio del inglés para resolver un misterio o completar un rompecabezas relacionado con los manglares, consolidando tu aprendizaje y divirtiéndote.', '¿Estás listo para el último desafío? En esta tarea final, deberás usar todas tus habilidades en inglés para resolver un misterio o completar un rompecabezas relacionado con la historia, geografía y ecología de los manglares. Te divertirás y aprenderás al mismo tiempo, mientras consolidas todos los conocimientos adquiridos durante las tareas anteriores. ¿Tienes lo que se necesita para ser un gran estudiante de inglés?', '{ "English skills", "mystery", "puzzle", "mangroves", "learning", "fun" }', 'https://storage.googleapis.com/eyeland-0/app/content/task_5/thumbnail_1.jpg', 'Imagen de la task', TRUE);

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
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 1, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un camino', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_2.jpg', 'vocabulary', NULL, 'La imagen muestra un camino.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Road', '¡Muy bien! La imagen muestra un camino.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un camino, no un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Bridge', '¡Uy!, no es correcto. La imagen muestra un camino, no un puente.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 2, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un parque natural', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/natural_park_2.jpg', 'vocabulary', NULL, 'La imagen muestra un parque natural.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Natural park', '¡Muy bien! La imagen muestra un parque natural.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Farm', '¡Uy!, no es correcto. La imagen muestra un parque natural, no un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un parque natural, no un río.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 3, 'Bridge', NULL, NULL, 'audio_select', 'Imagen de un puente', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bridge_1.jpg', 'vocabulary', NULL, 'La imagen muestra un puente.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Bridge', '¡Muy bien!.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Toll', '¡Uy!, no es correcto. Vuelve a escuchar atentamente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Farm', '¡Uy!, no es correcto. Vuelve a escuchar atentamente.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 4, 'The road is _ the natural park', NULL, NULL, 'fill', 'Imagen de un camino al lado de un parque natural', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_natural_park_1.jpg', 'prepositions', NULL, 'La imagen muestra un camino al lado de un parque natural.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'next to', '¡Excelente! "Next to" es la respuesta correcta, indica que el camino está al lado del parque natural.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'under', 'Incorrecto. "Under" se usa cuando algo está debajo de dos cosas. La respuesta correcta es "next to".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'over', 'Incorrecto. "Over" indica que algo está encima de otro objeto. La respuesta correcta es "next to".', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 5, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/mangrove_1.jpg', 'vocabulary', NULL, 'La imagen muestra un manglar.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Muy bien! La imagen muestra un manglar.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Beach', '¡Uy!, no es correcto. La imagen muestra un manglar, no una playa.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Farm', '¡Uy!, no es correcto. La imagen muestra un manglar, no una granja.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 6, 'The mangrove is _ the natural park', NULL, NULL, 'fill', 'Imagen de un manglar en un parque natural', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/mangrove_water_1.jpg', 'prepositions', NULL, 'La imagen muestra un manglar en el agua.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'in', '¡Correcto! La respuesta es "in".', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'on', 'Incorecto, "On" se usa para indicar que algo está sobre una superficie. La respuesta correcta es "in".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'at', 'Incorrecto, "At" se usa para indicar que algo está en un lugar específico. La respuesta correcta es "in".', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 7, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/swamp_1.jpg', 'vocabulary', NULL, 'La imagen muestra un pantano.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Muy bien! La imagen muestra un pantano.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Toll', '¡Uy!, no es correcto. La imagen muestra un pantano, no un peaje.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un pantano, no una granja.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 8, 'El camino está entre Barranquilla y el parque natural', NULL, NULL, 'order', 'Imagen de un camino entre Barranquilla e Isla Salamanca', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_1.jpg', 'prepositions', NULL, 'La imagen muestra un camino entre Barranquilla e Isla Salamanca.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'The road is between Barranquilla and the natural park', '¡Correcto!', TRUE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 9, 'Describe la imagen', NULL, NULL, 'select', 'Imagen de un bote', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/boat_1.jpg', 'vocabulary', NULL, 'La imagen muestra un bote.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Boat', '¡Muy bien! La imagen muestra un bote.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hotel', '¡Uy!, no es correcto. La imagen muestra agua, pero también un bote sobre ella.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Beach', '¡Uy!, no es correcto. La imagen muestra un bote, no una playa.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 10, 'The bridge is over the water', NULL, NULL, 'audio_order', 'Imagen de un puente sobre el agua', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bridge_river_1.jpg', 'prepositions', NULL, 'La imagen muestra un puente sobre el agua.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'The bridge is over the water', '¡Correcto!', TRUE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (1, NULL, 11, 'The natural park is near Barranquilla', NULL, NULL, 'audio_speaking', 'Imagen de un parque natural cerca de Barranquilla', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_1.jpg', 'prepositions', NULL, 'La imagen muestra un parque natural cerca de Barranquilla.') RETURNING id_question INTO last_question_id;

    -- duringtask 1
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (2, NULL, 1, 'Bienvenidos, ¡yo seré su guía turístico! Les estaré haciendo unas preguntas durante el recorrido.\Are you [on|sobre] the {bridge|puente}?', NULL, NULL, 'select', 'Imagen de personas sobre un puente', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bridge_1.jpg', NULL, 'beto', 'La imagen muestra personas sobre un puente.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, we are', '¡Correcto!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, we aren''t', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, we aren''t', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, we are', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there is', '¡Uy!, no es correcto. La imagen muestra personas sobre un puente.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (2, NULL, 2, '¡Espero que estén disfrutando del recorrido! Ahora, miren el puente.\Is there a {river|río} [under|debajo] the {bridge|puente}?', NULL, NULL, 'select', 'Imagen de un río bajo un puente', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bridge_river_1.jpg', NULL, 'beto', 'La imagen muestra un río bajo un puente.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there is', '¡Correcto!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there aren''t', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there isn''t', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, we are', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, she isn''t', '¡Uy!, no es correcto. La imagen muestra un río bajo un puente.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (2, NULL, 3, '¡Qué emoción! Cerca se puede ver el pueblo de Palermo.\Look at the {road|camino}. Is there a {town|pueblo} [near|cerca de] it?', NULL, NULL, 'select', 'Imagen de un pueblo cerca de un camino', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/town_road_1.jpg', NULL, 'beto', 'La imagen muestra un pueblo cerca de un camino.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Palermo town is near the road', '¡Correcto!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tasajera town is behind the road', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Palermo town is on the bridge', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tasajera town is under the river', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Palermo town is near Bogotá', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tasajera town isn''t near Palermo', '¡Uy!, no es correcto. La imagen muestra un pueblo cerca de un camino.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (2, NULL, 4, 'Luego de pasar por un hotel, estamos en el peaje Laureano Gómez. La siguiente parada será la granja Terranova.\Where is Laureano Gomez {toll|peaje}?', NULL, NULL, 'select', 'Imagen de un peaje entre un hotel y una granja', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/toll_1.jpg', NULL, 'beto', 'La imagen muestra un peaje entre un hotel y una granja.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the hotel and Terranova farm', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the beach and the river', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the toll and the road', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the bridge and the river', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the beach and the road', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It is between the hotel and the beach', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (2, NULL, 5, '¡A lo lejos se puede ver una costa!\Is Playa Linda {beach|playa} [far from|lejos de] Barranquilla?', NULL, NULL, 'select', 'Imagen de una playa lejos de Barranquilla', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/road_beach_1.jpg', NULL, 'beto', 'La imagen muestra una playa lejos de Barranquilla.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, it is', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, it isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, it isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, it is', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, he is', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (2, NULL, 6, 'El paisaje aquí es fascinante.\Are there {swamps|pantanos} [near|cerca de] the {beach|playa}?', NULL, NULL, 'select', 'Imagen de una playa con pantanos cerca', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/beach_swamps_1.jpg', NULL, 'beto', 'La imagen muestra una playa con pantanos cerca.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there are', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there aren''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there are', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there is', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (2, NULL, 7, '¡Ya estamos por terminar nuestro recorrido!\Is there a {farm|granja} [next to|junto a] Salamanca Island?', NULL, NULL, 'select', 'Imagen de una granja cerca de Isla Salamanca', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/farm_1.jpg', NULL, 'beto', 'La imagen muestra una granja cerca de Isla Salamanca.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there is', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there isn''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there are', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there aren''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there aren''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there is', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (2, NULL, 8, '¡Bienvenidos al Parque Isla Salamanca!\What is there [over|encima de] the {mangrove|manglar}?', NULL, NULL, 'select', 'Imagen de un manglar con un pajaro encima', 'https://storage.googleapis.com/eyeland-0/app/content/task_1/bird_mangrove_1.jpg', NULL, 'beto', 'La imagen muestra un manglar con un pajaro encima.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A bird', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A boat', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A fish', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A tree', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A flower', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A house', 'Incorrect', FALSE);
    
    -- postask 1

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (3, NULL, 1, '¡Hemos llegado al final! Revisemos lo aprendido con unas preguntas. Are there boats next to the road?', NULL, NULL, 'select&speaking', NULL, NULL, NULL, 'beto', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, there are.', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, there aren''t.', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (3, NULL, 2, 'What is there over the river?', NULL, NULL, 'select&speaking', NULL, NULL, NULL, 'beto', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A bridge', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'A hotel', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (3, NULL, 3, 'What was part of the road?', NULL, NULL, 'select&speaking', NULL, NULL, NULL, 'beto', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'The toll', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'The tunnel', 'Incorrect', FALSE);

    -- questions from task 2
    -- pretask 2

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 1, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de una gaviota.', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/seagull_1.jpg', 'vocabulary', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Seagull', '!Uy! ¡Casi! Era correcto.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Duck', '!Uy! ¡Casi! Es una gaviota.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Monkey', '!Uy! Ese no es el animal de la imagen.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 2, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/alligator_1.jpg', 'vocabulary', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Alligator', '!Uy! ¿Seguro de que no es un caimán?', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Frog', '!Uy! Revisa la imagen.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Turtle', '!Uy! ¿Estás seguro?', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 3, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de un ocelote', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/ocelot_1.jpg', 'vocabulary', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocelot', '!Uy! Este sí es un ocelote.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Cat', '!Uy! No es del todo un gato.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Puma', '!Uy! ¿Estás seguro?', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 4, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de un zorrochucho', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/common_opossum_1.jpg', 'vocabulary', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Common opossum', '!Uy! Este sí es un zorrochucho.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Dog', '!Uy! No es un perro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fox', '!Uy! Casi, pero no.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 5, '¿Cuál es el hábitat de un águila pescadora?', NULL, NULL, 'select', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/osprey_1.jpg', 'vocabulary', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aerial', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Terrestrial', '!Uy! ¿Estás seguro?', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aquatic', '!Uy! Aunque se alimenta de peces, no vive en el agua.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 6, 'Alligator', NULL, NULL, 'audio_order-word', 'Imagen de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/alligator_1.jpg', 'vocabulary', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Alligator', 'Correct', TRUE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 7, '¿Cuál es el animal de la imagen?', NULL, NULL, 'flashcard', 'Imagen de un manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/manatee_1.jpg', 'vocabulary', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Manatee', '!Uy! Este sí es un manatí.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Dolphin', '!Uy! No es un delfín.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Whale', '!Uy! No hay ballenas en este hábitat.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 8, '¿Cuál es el hábitat de un róbalo?', NULL, NULL, 'select', 'Imagen de un róbalo bajo el agua', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/seabass_1.jpg', 'vocabulary', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aquatic', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Terrestrial', '!Uy! ¿Estás seguro?', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aerial', '!Uy! No todos los peces vuelan.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 9, '¿Qué se dice al encontrarse con alguien por primera vez?', NULL, NULL, 'select', 'Imagen de personas conociéndose', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/personal_presentation_1.jpg', 'personal_presentation', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Nice to meet you', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'See you later', 'No deberías despedirte si acabas de conocer a alguien', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'How are you?', 'No es una presentación', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 10, '¿Cómo se pregunta a alguien de dónde es?', NULL, NULL, 'select', 'Imagen de una persona preguntando a otra de dónde es', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/personal_presentation_2.jpg', 'personal_presentation', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Where are you from?', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'How are you?', '"How are you?" significa "¿Cómo estás?"', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'What do you do?', '"What do you do?" significa "¿Qué haces?"', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 11, 'Tengo 14 años', NULL, NULL, 'order', 'Imagen de una persona diciendo su edad', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/personal_presentation_3.jpg', 'personal_presentation', NULL, NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I am 14 years old', 'Correct', TRUE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (4, NULL, 12, 'I''m from Colombia', NULL, NULL, 'audio_speaking', 'Imagen de una persona diciendo que es de Colombia', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/personal_presentation_4.jpg', 'personal_presentation', NULL, NULL) RETURNING id_question INTO last_question_id;

    -- duringtask 2

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 1, '¡Gusto en conocerlos! Me llamo Valery y yo los ayudaré a conocer los animales y a presentarse. Estamos frente a un ocelote.\The {ocelot|ocelote} likes to move [among|entre] {trees|árboles}. What do you like to do?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/ocelot_1.mp3', NULL, 'select', 'Imagen de un ocelote en un árbol', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/ocelot_tree_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like to go to school', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like apples', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I go to school', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I''m going to school', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It likes to move among trees', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I like', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 2, '¡Miren ese pato nadando en el río!\The {duck|pato} lives [near|cerca de] the {water|agua}. Where do you live?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/duck_1.mp3', NULL, 'select', 'Imagen de un pato cerca del río', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/duck_river_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I live in Barranquilla', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I am from Colombia', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It lives near the water', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It lives in Isla Salamanca', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I go to school', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 3, '¡Miren hacia arriba! Es un majestuoso águila pescadora.\The {osprey|águila pescadora} goes fishing [during|durante] the {day|día}. What do you do in the {morning|mañana}?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/osprey_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I have breakfast in the morning', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like to eat in the afternoon', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I have lunch in the morning', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It goes fishing during the morning', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It goes fishing', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 4, 'Observen bajo el agua. ¡Es un amigable manatí!\The {manatee|manatí} rests [on|en] the {river|río} {bottom|fondo}. Where do you rest?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/manatee_water_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I rest at home', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I rest in the school', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I rest at night', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It rests on the river bottom', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It rests on the river', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I rest in the morning', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 5, 'Miren esa elegante garza\The {heron|garza} stays [over|en] the {water|agua} to relax. How do you relax?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/heron_1.mp3', NULL, 'select', 'Imagen de una garza relajada', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/heron_water_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like to read a book', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I''m reading a book', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I reads books', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I likes to read a book', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It relaxes on the water', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I read a books', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 6, '¡Cuidado con el caimán!\The {alligator|caimán} swims [under|bajo] the {water|agua}. Do you like to swim?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán nadando', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/alligator_water_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like to swim', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I''m swimming', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I swims', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I likes to swim', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It swims under the water', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I drink water', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 7, 'Shhh, pueden espantar a la gaviota.\The {seagull|gaviota} eats {fish|pescado} [from|de] the {river|río}. Do you eat {fish|pescado}?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/seagull_1.mp3', NULL, 'select', 'Imagen de una gaviota', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/seagull_fish_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I eats', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I eat', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I am', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It eats fish', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I eats fish', 'Incorrect', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 8, '¡Miren ese róbalo saltando en el agua!\The {sea bass|robalo} jumps [out of|fuera de] the {water|agua}. Can you jump high?', NULL, NULL, 'select', 'Imagen de un robalo saltando', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/seabass_2.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I can', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I can''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I can', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I don''t', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It can jump', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 9, '¡Qué bonito colibrí!\The {hummingbird|colibrí} flies [around|alrededor de] the {flowers|flores}. What is your favorite {flower|flor}?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/hummingbird_1.mp3', NULL, 'select', 'Imagen de un colibrí', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/hummingbird_flower_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I like orchids', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It likes orchids', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I likes orchids', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'It flies around the flowers', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Yes, I do', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'No, I don''t', 'Incorrect', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (5, NULL, 10, '¡No se asusten del lagarto!\The {lizard|lagarto} likes the {sun|sol} [on top of|encima de] the {rocks|rocas}. How do you feel in the {sun|sol}?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/lizard_rocks_1.jpg', NULL, 'valery', NULL) RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel happy', 'Correct', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel in the sun', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel likes the sun', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel the sun likes me', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel is sunny', 'Incorrect', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'I feel are hot', 'Incorrect', FALSE);

    -- postask 2

    INSERT INTO question (id_task_stage, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (6, 2, '¡Bien hecho! Última pregunta: what''s your favorite animal from Isla Salamanca?', NULL, NULL, 'open', NULL, NULL, NULL, 'chucho', 'My favorite animal is _') RETURNING id_question INTO last_question_id;
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (6, NULL, 1, '!Hola! Soy el zorro Chucho y te haré unas preguntas. Can you present yourself in english?', NULL, NULL, 'open', NULL, NULL, NULL, 'chucho', 'My name is _, I''m _ years old, I''m from _ and I like _') RETURNING id_question INTO last_question_id;
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (6, NULL, 2, '¡Bien hecho! Última pregunta: what''s your favorite animal from Isla Salamanca?', NULL, NULL, 'open', NULL, NULL, NULL, 'chucho', 'My favorite animal is _') RETURNING id_question INTO last_question_id;
    
    -- questions from task 3
    
    -- pretask 3

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (7, NULL, 1, 'Select the habitat', NULL, NULL, 'select', 'Imagen de un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/swamp_1.jpg', 'vocabulary', NULL, 'La imagen muestra un pantano.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Muy bien! La imagen muestra un patano.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', '¡Uy!, no es correcto. La imagen muestra un pantano, no un océano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un patano, no un manglar.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (7, NULL, 2, 'Select the name', NULL, NULL, 'select', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_1.jpg', 'vocabulary', NULL, 'La imagen muestra un águila pescadora.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto (Osprey)', '¡Muy bien! La imagen muestra un águila pescadora.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina (Lizard)', '¡Uy!, no es correcto. La imagen muestra un águila pescadora, no un lagarto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly (Manatee)', '¡Uy!, no es correcto. La imagen muestra un águila pescadora, no un manatí.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (7, NULL, 3, 'Select the age', NULL, NULL, 'select', 'Imagen de un ocelote adulto, de aproximadamente 15 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/ocelot_15yo_1.jpg', 'vocabulary', NULL, 'La imagen muestra un ocelote adulto, de aproximadamente 15 años.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Muy bien! La imagen muestra un ocelote de 15 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un ocelote de 15 años, no un ocelote de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un ocelote de 15 años, no un ocelote de 7 años.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (7, NULL, 4, 'Select the body part', NULL, NULL, 'select', 'Imagen de la cola de un lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_tail_1.jpg', 'vocabulary', NULL, 'La imagen muestra la cola de un lagarto.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Muy bien! La imagen muestra la cola de un lagarto.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no unos dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Wing', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no unas alas.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (7, NULL, 5, 'Select the skills', NULL, NULL, 'select', 'Imagen de un pato mostrando sus habilidades para nadar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/duck_swim_1.jpg', 'vocabulary', NULL, 'La imagen muestra un pato nadando.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Muy bien! La imagen muestra un pato nadando.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un pato nadando, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Uy!, no es correcto. La imagen muestra un pato nadando, no volando.', FALSE);

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (7, NULL, 6, 'Select the diet', NULL, NULL, 'select', 'Imagen de una gaviota pescando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/seagull_fish_1.jpg', 'vocabulary', NULL, 'La imagen muestra una gaviota pescando.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Muy bien! La imagen muestra una dieta carnívora.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. La imagen muestra una dieta carnívora, no omnívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. La imagen muestra una dieta carnívora, no herbívora.', FALSE);

    -- duringtask 3
    UPDATE task_stage SET mechanics = '{"question_group-team_name"}' WHERE id_task_stage = 8;

    INSERT INTO question_group (id_team_name) VALUES (1) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 1, 'Where do ospreys live?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora en un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_mangrove_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora en un manglar.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Muy bien! La imagen muestra un águila pescadora en un manglar.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un águila pescadora en un manglar, no en un río.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 2, 'What''s the osprey''s name?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora llamada Otto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora llamada Otto.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Muy bien! La imagen muestra un águila pescadora llamada Otto.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Molly.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Molly.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un águila pescadora llamada Otto, no Molly.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 3, 'How old is the osprey?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora de 7 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_7yo_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora de 7 años.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Muy bien! La imagen muestra un águila pescadora de 7 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 15 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 15 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un águila pescadora de 7 años, no de 15 años.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 4, 'Select the body part of the osprey', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/osprey_1.mp3', NULL, 'select', 'Imagen del ala de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_wing_1.jpg', NULL, NULL, 'La imagen muestra el ala de un águila pescadora.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Wing', '¡Muy bien! La imagen muestra el ala de un águila pescadora.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra el ala de un águila pescadora, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra el ala de un águila pescadora, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra el ala de un águila pescadora, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra el ala de un águila pescadora, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra el ala de un águila pescadora, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra el ala de un águila pescadora, no sus dientes.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 5, 'Select the skill of the osprey', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora volando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_fly_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora volando.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Muy bien! La imagen muestra un águila pescadora volando.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un águila pescadora volando, no escondiéndose.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 6, 'Select the diet of the osprey', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/osprey_1.mp3', NULL, 'select', 'Imagen de un águila pescadora pescando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_fish_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora pescando.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Muy bien! El águila pescadora es carnívora.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no herbívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no omnívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no herbívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no omnívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no herbívora.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El águila pescadora es carnívora, no omnívora.', FALSE);
    
    INSERT INTO question_group (id_team_name) VALUES (2) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 7, 'Where do lizards live?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto en un pantano', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_swamp_1.jpg', NULL, NULL, 'La imagen muestra un lagarto en un pantano.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Muy bien! La imagen muestra un lagarto en un pantano.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un río.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Uy!, no es correcto. La imagen muestra un lagarto en un pantano, no en un río.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 8, 'What''s the lizard''s name?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/lizard_1.mp3', NULL, 'select', 'Imagen de una lagarto llamada Lina', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_1.jpg', NULL, NULL, 'La imagen muestra una lagarto llamada Lina.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Muy bien! La imagen muestra una lagarto llamada Lina.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Molly.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aldo', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Aldo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Molly.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aldo', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Aldo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Molly.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aldo', '¡Uy!, no es correcto. La imagen muestra un lagarto llamada Lina, no Aldo.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 9, 'How old is the lizard?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto de 11 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_11yo_1.jpg', NULL, NULL, 'La imagen muestra un lagarto de 11 años.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Muy bien! La imagen muestra un lagarto de 11 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 15 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 15 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Uy!, no es correcto. La imagen muestra un lagarto de 11 años, no de 15 años.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 10, 'Select the body part of the lizard', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/lizard_1.mp3', NULL, 'select', 'Imagen de la cola de un lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_tail_1.jpg', NULL, NULL, 'La imagen muestra la cola de un lagarto.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Muy bien! La imagenla muestra la cola de un lagarto.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra la cola de un lagarto, no sus dientes.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 11, 'Select the skill of the lizard', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto corriendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_run_1.jpg', NULL, NULL, 'La imagen muestra un lagarto corriendo.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Muy bien! La imagen muestra un lagarto corriendo.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un lagarto corriendo, no escondiéndose.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 12, 'Select the diet of the lizard', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/lizard_1.mp3', NULL, 'select', 'Imagen de un lagarto comiendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_eat_1.jpg', NULL, NULL, 'La imagen muestra un lagarto comiendo.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Muy bien! El lagarto es omnívoro.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no herbívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no carnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no herbívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no carnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no herbívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Uy!, no es correcto. El lagarto es omnívoro, no carnívoro.', FALSE);
    
    INSERT INTO question_group (id_team_name) VALUES (3) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 13, 'Where do alligators live?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán en un río', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_river_1.jpg', NULL, NULL, 'La imagen muestra un caimán en un río.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Muy bien! La imagen muestra un caimán en un río.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un caimán en un río, no en un pantano.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 14, 'What''s the alligator''s name?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán llamado Aldo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_1.jpg', NULL, NULL, 'La imagen muestra un caimán llamado Aldo.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Aldo', '¡Muy bien! La imagen muestra un caimán llamado Aldo.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra un caimán llamado Aldo, no Lina.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 15, 'How old is the alligator?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán de 5 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_5yo_1.jpg', NULL, NULL, 'La imagen muestra un caimán de 5 años.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '5 years old', '¡Muy bien! La imagen muestra un caimán de 5 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un caimán de 5 años, no de 7 años.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 16, 'Select the body part of the alligator', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/alligator_1.mp3', NULL, 'select', 'Imagen de las garras de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_claws_1.jpg', NULL, NULL, 'La imagen muestra las garras de un caimán.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Muy bien! La imagenla muestra las garras de un caimán.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no sus dientes.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Uy!, no es correcto. La imagen muestra las garras de un caimán, no sus dientes.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 17, 'Select the skill of the alligator', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán escondiéndose', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_hide_1.jpg', NULL, NULL, 'La imagen muestra un caimán escondiéndose.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Muy bien! La imagen muestra un caimán escondiéndose.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no nadando.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un caimán escondiéndose, no corriendo.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 18, 'Select the diet of the alligator', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/alligator_1.mp3', NULL, 'select', 'Imagen de un caimán comiendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_eat_1.jpg', NULL, NULL, 'La imagen muestra un caimán comiendo.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Muy bien! El caimán es carnívoro.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no herbívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no omnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no herbívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no omnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no herbívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El caimán es carnívoro, no omnívoro.', FALSE);
    
    INSERT INTO question_group (id_team_name) VALUES (4) RETURNING id_question_group INTO last_question_group_id;
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 19, 'Where do manatees live?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí en un océano', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_ocean_1.jpg', NULL, NULL, 'La imagen muestra un manatí en un océano.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'River', '¡Muy bien! La imagen muestra un manatí en un océano.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un pantano.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un manglar.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', '¡Uy!, no es correcto. La imagen muestra un manatí en un océano, no en un pantano.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 20, 'What''s the manatee''s name?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/manatee_1.mp3', NULL, 'select', 'Imagen de una manatí llamada Molly', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_1.jpg', NULL, NULL, 'La imagen muestra una manatí llamada Molly.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Molly', '¡Muy bien! La imagen muestra una manatí llamada Molly.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Lina.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Otto', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Otto.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Lina', '¡Uy!, no es correcto. La imagen muestra una manatí llamada Molly, no Lina.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 21, 'How old is the manatee?', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí de 15 años', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_15yo_1.jpg', NULL, NULL, 'La imagen muestra un manatí de 15 años.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '15 years old', '¡Muy bien! La imagen muestra un manatí de 15 años.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 7 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '11 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 11 años.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, '7 years old', '¡Uy!, no es correcto. La imagen muestra un manatí de 15 años, no de 7 años.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 22, 'Select the body part of the manatee', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/manatee_1.mp3', NULL, 'select', 'Imagen de los dientes de un manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_teeth_1.jpg', NULL, NULL, 'La imagen muestra los dientes de un manatí.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Teeth', '¡Muy bien! La imagenla muestra los dientes de un manatí.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no sus garras.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Tail', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no su cola.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Claws', '¡Uy!, no es correcto. La imagen muestra los dientes de un manatí, no sus garras.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 23, 'Select the skill of the manatee', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí nadando', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_swim_1.jpg', NULL, NULL, 'La imagen muestra un manatí nadando.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', '¡Muy bien! La imagen muestra un manatí nadando.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no corriendo.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Hide', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no escondiéndose.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', '¡Uy!, no es correcto. La imagen muestra un manatí nadando, no corriendo.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (8, last_question_group_id, 24, 'Select the diet of the manatee', 'https://storage.googleapis.com/eyeland-0/app/content/task_2/audio/manatee_1.mp3', NULL, 'select', 'Imagen de un manatí comiendo', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_eat_1.jpg', NULL, NULL, 'La imagen muestra un manatí comiendo.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Herbivorous', '¡Muy bien! El manatí es herbívoro.', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no carnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no omnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no carnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no omnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Carnivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no carnívoro.', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Omnivorous', '¡Uy!, no es correcto. El manatí es herbívoro, no omnívoro.', FALSE);
    
    -- postask 3
    UPDATE task_stage SET mechanics = '{"question_group-duringtask_based"}' WHERE id_task_stage = 9;

    INSERT INTO question_group (id_team_name) VALUES (1) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 1, 'Missing osprey. An osprey is lost. His _ is Otto', NULL, NULL, 'fill', 'Imagen de un águila pescadora perdida', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora perdida.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'name', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'habitat', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'food', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 2, 'He is 7 years old. He lives in a _', NULL, NULL, 'fill', 'Imagen de un águila pescadora en un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora en un manglar.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 3, 'He has brown and white wings, so he can _ and hunt fish. Is he carnivourous? Yes!', NULL, NULL, 'fill', 'Imagen de un águila pescadora', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/osprey_lost_1.jpg', NULL, NULL, 'La imagen muestra un águila pescadora.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', 'Incorrecto.', FALSE);

    INSERT INTO question_group (id_team_name) VALUES (2) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 4, 'Missing lizard. A lizard is lost. Her _ is Lina', NULL, NULL, 'fill', 'Imagen de una lagarto perdida', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra una lagarto perdida.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'name', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'habitat', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'food', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 5, 'She is 11 years old. She lives in a _', NULL, NULL, 'fill', 'Imagen de una lagarto en un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra una lagarto en un manglar.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 6, 'She has brown and white wings, so he can _ and hunt fish. Is she carnivourous? Yes!', NULL, NULL, 'fill', 'Imagen de una lagarto', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/lizard_lost_1.jpg', NULL, NULL, 'La imagen muestra un lagarto.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', 'Incorrecto.', FALSE);

    INSERT INTO question_group (id_team_name) VALUES (3) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 7, 'Missing alligator. An alligator is lost. His _ is Aldo', NULL, NULL, 'fill', 'Imagen de un caimán perdido', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán perdido.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'name', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'habitat', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'food', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 8, 'He is 5 years old. He lives in a _', NULL, NULL, 'fill', 'Imagen de caimán en un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán en un manglar.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 9, 'He has brown and white wings, so he can _ and hunt fish. Is he carnivourous? Yes!', NULL, NULL, 'fill', 'Imagen de un caimán', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/alligator_lost_1.jpg', NULL, NULL, 'La imagen muestra un caimán.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', 'Incorrecto.', FALSE);

    INSERT INTO question_group (id_team_name) VALUES (4) RETURNING id_question_group INTO last_question_group_id;

    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 10, 'Missing manatee. An manatee is lost. His _ is Molly', NULL, NULL, 'fill', 'Imagen de una manatí perdida', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí perdida.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'name', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'habitat', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'food', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 11, 'He is 15 years old. He lives in a _', NULL, NULL, 'fill', 'Imagen de una manatí en un manglar', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí en un manglar.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Mangrove', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swamp', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Ocean', 'Incorrecto.', FALSE);
    
    INSERT INTO question (id_task_stage, id_question_group, question_order, content, audio_url, video_url, type, img_alt, img_url, topic, character, hint) VALUES (9, last_question_group_id, 12, 'He has brown and white wings, so he can _ and hunt fish. Is he carnivourous? Yes!', NULL, NULL, 'fill', 'Imagen de una manatí', 'https://storage.googleapis.com/eyeland-0/app/content/task_3/manatee_lost_1.jpg', NULL, NULL, 'La imagen muestra una manatí.') RETURNING id_question INTO last_question_id;
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Fly', '¡Excelente!', TRUE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Swim', 'Incorrecto.".', FALSE);
    INSERT INTO option (id_question, content, feedback, correct) VALUES (last_question_id, 'Run', 'Incorrecto.', FALSE);
    
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
-- INSERT INTO release (url, version) VALUES ('https://storage.googleapis.com/eyeland-0/app/dist/v/eyeland-3.5.6.1.apk', '3.5.6.1');
INSERT INTO release (url, version) VALUES ('https://storage.googleapis.com/eyeland-0/app/dist/v/eyeland-3.5.10.apk', '3.5.10');
