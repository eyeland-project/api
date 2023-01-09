// import model
const Links = require('../models/Links');

// creating the controllers
const getLinks = async (req, res) => {
    const links = await Links.findAll();
    res.json(links);
};

const getLink = async (req, res) => {
    const link = await Links.findOne({
        where: {
            id_link: req.params.id
        }
    });
    res.json(link);
};

const createLink = async (req, res) => {
    const { tema, url_dir, id_task } = req.body;
    const newLink = await Links.create({
        tema,
        url_dir,
        id_task
    }, {
        fields: ['tema', 'url_dir', 'id_task']
    });
    res.json(newLink);
};

const updateLink = async (req, res) => {
    const { id_link } = req.params;
    const { tema, url_dir, id_task } = req.body;
    const link = await Links.findOne({
        where: {
            id_link
        }
    });
    await link.update({
        tema,
        url_dir,
        id_task
    });
    res.json(link);
};

const deleteLink = async (req, res) => {
    const { id_link } = req.params;
    await Links.destroy({
        where: {
            id_link
        }
    });
    res.json({ message: "Link deleted" });
};

// export the controllers
module.exports = {
    getLinks,
    getLink,
    createLink,
    updateLink,
    deleteLink
};