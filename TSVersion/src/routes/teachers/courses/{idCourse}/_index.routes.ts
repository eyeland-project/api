import { Router } from "express";
import passport from "passport";
import { deleteCourse, getCourse, updateCourse, startSession } from "../../../../controllers/teachers/course.controller";

const auth = passport.authenticate('jwt-teacher', { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get('/', getCourse);
router.put('/', updateCourse);
router.delete('/', deleteCourse);
router.delete('/startSession', startSession);

export default router;
