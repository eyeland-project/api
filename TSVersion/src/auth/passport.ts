// passport setting up

import passport  from'passport';
import {Strategy as LocalStrategy}  from'passport-local';
import {Strategy as JWTSrategy}  from'passport-jwt';
import {ExtractJwt}  from'passport-jwt';

passport.use("signup", new LocalStrategy({
    usernameField: "username",
    passwordField: "password"
    }, async (username, password, done) => {
        try {
            // const user = await User.create({username, password});
            const user = {_id: "dfsfsfsdfw2r34rq", username, password};
            return done(null, user);
        } catch (error) {
            done(error);
        }
    }
));

passport.use("login", new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
    }, async (_req, username, password, done) => {
        try {
            // const user = await User.findOne({email});
            // if (!user) {
            //     return done(null, false, {message: "User not found"});
            // }
            // const validate = await user.isValidPassword(password);
            // if (!validate) {
            //     return done(null, false, {message: "Wrong Password"});
            // }
            const user = {_id: "dfsfsfsdfw2r34rq", username, password};
            return done(null, user, {message: "Logged in Successfully"});
        } catch (error) {
            return done(error);
        }
    }
));

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET || " top_secret "
};

passport.use(new JWTSrategy(opts, async (jwt_payload, done) => {
    try {
        // check if the token has expired

        // const expirationDate = new Date(jwt_payload.exp * 1000);
        // if (expirationDate < new Date()) {
        //     return done(null, false);
        // }


        // const user = await User.findById(jwt_payload.id);
        console.log(jwt_payload);
        const user = {_id: jwt_payload.user._id, username: jwt_payload.user.username}
        if (user) {
            done(null, user);
        } else
        done(null, false);
    } catch (error) {
        // logger.error(error);
        done(error, false);
    }
}));