const router = require('express').Router();
const passport = require('passport');
// import the pretask controllers
const { getLinks, getLink, createLink, updateLink, deleteLink } = require('../controllers/pretask.controller');

// setting up the authentication middleware
const auth = passport.authenticate("jwt", { session: false });
router.use(auth);

// routes
router.get("/", getLinks);

router.get("/:id", getLink);

router.post("/", createLink);

router.put("/:id", updateLink);

router.delete("/:id", deleteLink);

// export the router
module.exports = router;