const router = require('express').Router();
const passport = require('passport');
// import Preguntas controllers
const { count, findAll, findOne} = require('../controllers/pregunta.controller');

// setting up the authentication middleware
const auth = passport.authenticate("jwt", { session: false });
router.use(auth);

// routes
router.get("/count", count);

router.get("/", findAll);

router.get("/:id", findOne);

// export the router
module.exports = router;