// import passport strategies and express router
const passport = require('passport');
const router = require('express').Router();
// import libraries
const jwt = require('jsonwebtoken');


// create a route to signup
router.post('/signup', passport.authenticate('signup', {session: false}), async (req, res) => {
    res.json({
        message: 'Signup successful',
        user: req.user
    });
});

// create a route to login
router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error('An Error occured');
                return next(error);
            }
            req.login(user, {session: false}, async (error) => {
                if (error) return next(error);
                const body = {_id: user._id, username: user.username};
                const token = jwt.sign({user: body}, process.env.SECRET || " top_secret ");
                return res.json({token});
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

// export the router
module.exports = router;
