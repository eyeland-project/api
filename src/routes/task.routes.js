// imports
const router = require('express').Router();
const passport = require('passport');
const { 
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskLinks
 } = require('../controllers/task.controller');

//setting the authentication middleware
const auth = passport.authenticate('jwt', { session: false });

// routes
router.get('/', auth, getTasks);
router.get('/:id', auth, getTask);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);
router.get('/:id/links', /**auth,/**/ getTaskLinks);


// export the router    
module.exports = router;