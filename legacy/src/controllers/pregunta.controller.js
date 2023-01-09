// import models
const Pregunta = require('../models/Preguntas');
const Respuesta = require('../models/Respuestas');

// obtener el número de preguntas
exports.count = (req, res) => {
    Pregunta.count()
        .then((numPreguntas) => {
            res.send({numPreguntas});
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Error al obtener el número de preguntas',
            });
        });
};

// obtener todas las preguntas
exports.findAll = (req, res) => {
    Pregunta.find()
        .then((preguntas) => {
            res.send(preguntas);
            })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Error al obtener las preguntas',
            });
    });
};

// obtener una pregunta por id
exports.findOne = (req, res) => {
    Pregunta.findByPk(req.params.id)
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
