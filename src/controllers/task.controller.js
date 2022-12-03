// import model
const Task = require('../models/Tasks');
const Link = require("../models/Links")
const Pregunta = require("../models/Preguntas");
const Respuesta = require("../models/Respuestas");
// import the practica mock
const practicaMock = require('../mock/practica.mock.json');

// creating the controllers
const getTasks = async (req, res) => {
    const tasks = await Task.findAll();
    res.json(tasks);
};

const getTask = async (req, res) => {
    const task = await Task.findOne({     
        where: {
            id_task: req.params.id
        }
    });
    res.json(task);
};

const createTask = async (req, res) => {    
    const { tema, descripcion, orden } = req.body;
    const newTask = await Task.create({
        tema,
        descripcion,
        orden
    }, {
        fields: ['tema', 'descripcion', 'orden']
    });
    res.json(newTask);
};

const updateTask = async (req, res) => {
    const { id_task } = req.params;
    const { tema, descripcion, orden } = req.body;
    const task = await Task.findOne({
        where: {
            id_task
        }
    });
    await task.update({
        tema,
        descripcion,
        orden
    });
    res.json(task);
};

const deleteTask = async (req, res) => {
    const { id_task } = req.params;
    await Task.destroy({
        where: {
            id_task
        }
    });
    res.json({ message: "Task deleted" });
};

// get all the links from a given task (with the id_task)
const getTaskLinks = async (req, res) => {
    const links = await Link.findAll({
        where: {
            id_task: req.params.id
        }
    });
    res.json(links);
};

// obtener una pregunta basada en el id_task y el orden
const getTaskPregunta = (req, res) => {
    Pregunta.findOne({where: { id_task: parseInt(req.params.id), orden: parseInt(req.params.orden) }})
        .then((pregunta) => {
            if (!pregunta) {
                return res.status(404).send({
                message: 'Pregunta no encontrada',
                });
            }
            // enviar la pregunta con sus respuestas
            Respuesta.findAll({where: { id_pregunta: pregunta.id_pregunta }})
                .then((respuestas) => {
                    // pregunta.respuestas = respuestas;
                    res.send({pregunta, respuestas: respuestas});
                })
                .catch((err) => {
                    res.status(500).send({
                        message: err.message || 'Error al obtener las respuestas',
                    });
                });
        })
        .catch((err) => {
            console.error(err);
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                message: 'Pregunta no encontrada',
                });
            }
            return res.status(500).send({
                message: 'Error al obtener la pregunta',
            });
        });
    };

// obtener una preguntas 
const getTaskPreguntas = (req, res) => {
    Pregunta.findAll({where: { id_task: parseInt(req.params.id_task) }})
        .then((preguntas) => {
            if (!preguntas) {
                return res.status(404).send({
                message: 'Preguntas no encontradas',
                });
            }
            // enviar la pregunta con sus respuestas
            res.send({preguntas});
        })
        .catch((err) => {
            console.error(err);
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                message: 'Preguntas no encontradas',
                });
            }
            return res.status(500).send({
                message: 'Error al obtener las preguntas',
            });
        });
    };

// obtener el numero de preguntas de una tarea
const getTaskNumPreguntas = (req, res) => {
    Pregunta.count({where: { id_task: parseInt(req.params.id) }})
        .then((numPreguntas) => {
            if (!numPreguntas) {
                return res.status(404).send({
                message: 'Preguntas no encontradas',
                });
            }
            // enviar la pregunta con sus respuestas
            res.send({numPreguntas});
        })
        .catch((err) => {
            console.error(err);
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                message: 'Preguntas no encontradas',
                });
            }
            return res.status(500).send({
                message: 'Error al obtener las preguntas',
            });
        });
    };

// obtener el practica de una tarea
const getTaskPractica = (req, res) => {
    res.send(practicaMock[req.params.id]);
};

// obtener la descripcion de una tarea
const getTaskDescripcion = (req, res) => {
    Task.findOne({where: { id_task: parseInt(req.params.id) }})
        .then((task) => {
            if (!task) {
                return res.status(404).send({
                    message: 'Tarea no encontrada',
                });
            }
            // enviar la pregunta con sus respuestas
            res.send({descripcion: task.descripcion});
        })
        .catch((err) => {
            console.error(err);
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: 'Tarea no encontrada',
                });
            }
            return res.status(500).send({
                message: 'Error al obtener la tarea',
            });
        });
    };


// export the controllers
module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskLinks,
    getTaskPregunta,
    getTaskPreguntas,
    getTaskNumPreguntas,
    getTaskPractica,
    getTaskDescripcion,
};
