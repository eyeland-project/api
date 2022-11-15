// import model
const Task = require('../models/Tasks');
const Link = require("../models/Links")

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


// export the controllers
module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskLinks
};
