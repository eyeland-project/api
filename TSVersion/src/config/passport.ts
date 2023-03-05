import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTSrategy, ExtractJwt } from "passport-jwt";
import { AdminModel, StudentModel, TeacherModel } from "../models";

// passport setting up
// passport.use('signup', new LocalStrategy({
//     usernameField: 'username',
//     passwordField: 'password'
// }, async (username, password, done) => {
//     try {
//         // const user = await User.create({username, password});
//         const user: any = { _id: 'dfsfsfsdfw2r34rq', username, password };
//         return done(null, user);
//     } catch (err) {
//         done(err);
//     }
// }));

// LOGIN
// student
passport.use(
    "login-student",
    new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
        },
        async (username, password, done) =>
            login(username, password, done, "student")
    )
);

// teacher
passport.use(
    "login-teacher",
    new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
        },
        async (username, password, done) =>
            login(username, password, done, "teacher")
    )
);

// admin
passport.use(
    "login-admin",
    new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
        },
        async (username, password, done) =>
            login(username, password, done, "admin")
    )
);

// JWT
// student
passport.use(
    "jwt-student",
    new JWTSrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || " top secret ",
        },
        async (jwt_payload: { id: number }, done: Function) =>
            extractJwt(jwt_payload, done, "student")
    )
);

// teacher
passport.use(
    "jwt-teacher",
    new JWTSrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || " top secret ",
        },
        async (jwt_payload: { id: number }, done: Function) =>
            extractJwt(jwt_payload, done, "teacher")
    )
);

// admin
passport.use(
    "jwt-admin",
    new JWTSrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || " top secret ",
        },
        async (jwt_payload: { id: number }, done: Function) =>
            extractJwt(jwt_payload, done, "admin")
    )
);

async function login(
    username: string,
    password: string,
    done: Function,
    userType: "student" | "teacher" | "admin"
) {
    const query = { where: { username } };
    try {
        const user =
            userType === "student"
                ? await StudentModel.findOne(query)
                : userType === "teacher"
                ? await TeacherModel.findOne(query)
                : await AdminModel.findOne(query);

        if (!user) {
            return done(null, false, { message: "User not found (passport)" });
        }
        if (!user.comparePassword(password)) {
            return done(null, false, { message: "Wrong Password" });
        }
        done(null, {
            id:
                user instanceof StudentModel
                    ? user.id_student
                    : user instanceof TeacherModel
                    ? user.id_teacher
                    : user.id_admin,
        });
    } catch (err) {
        return done(err);
    }
}

async function extractJwt(
    jwt_payload: { id: number },
    done: Function,
    userType: "student" | "teacher" | "admin"
) {
    const { id } = jwt_payload;
    try {
        const user =
            userType === "student"
                ? await StudentModel.findByPk(id)
                : userType === "teacher"
                ? await TeacherModel.findByPk(id)
                : await AdminModel.findByPk(id);

        if (!user) return done(null, false);

        done(null, id ? jwt_payload : false);
    } catch (err) {
        done(err);
    }
}
