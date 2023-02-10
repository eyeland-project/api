import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTSrategy, ExtractJwt } from 'passport-jwt';
import StudentModel from '../models/Student';

// passport setting up
passport.use('signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        // const user = await User.create({username, password});
        const user: any = { _id: 'dfsfsfsdfw2r34rq', username, password };
        return done(null, user);
    } catch (err) {
        done(err);
    }
}));

passport.use('login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (_req, username, password, done) => {
    try {
        // const user = await User.findOne({email});
        // if (!user) {
        //     return done(null, false, {message: 'User not found'});
        // }
        // const validate = await user.isValidPassword(password);
        // if (!validate) {
        //     return done(null, false, {message: 'Wrong Password'});
        // }
        // const user = { _id: 'dfsfsfsdfw2r34rq', username, password };
        // return done(null, user, { message: 'Logged in Successfully' });

        // done(null, 1);
        // console.log(await Student.findAll());
        
        const student = await StudentModel.findOne({
            attributes: ['id_student', 'username', 'password'],
            where: { username }
        });
        if (!student) {
            // TODO: check if it's teacher or admin
            return done(null, false, { message: 'Student not found (passport)' });
        }
        if (!student.comparePassword(password)) {
            return done(null, false, { message: 'Wrong Password' });
        }
        done(null, student.id_student);
    } catch (err) {
        return done(err);
    }
}
));

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET || ' top_secret '
};

passport.use(new JWTSrategy(opts, async (jwt_payload: {user: {_id: number}}, done) => {
    try {
        // check if the token has expired

        // const expirationDate = new Date(jwt_payload.exp * 1000);
        // if (expirationDate < new Date()) {
        //     return done(null, false);
        // }


        // const user = await User.findById(jwt_payload.id);
        console.log(jwt_payload);
        const user = { _id: jwt_payload.user._id}
        if (user) {
            done(null, user);
        } else
            done(null, false);
    } catch (error) {
        // logger.error(error);
        done(error);
    }
}));
