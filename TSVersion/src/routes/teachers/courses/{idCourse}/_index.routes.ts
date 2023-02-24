import { Router } from "express";
import passport from "passport";
import { deleteCourse, getCourse, updateCourse } from "../../../../controllers/teachers/course.controller";

const auth = passport.authenticate('jwt-teacher', { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get('/:idCourse', getCourse);
router.put('/:idCourse', updateCourse);
router.delete('/:idCourse', deleteCourse);

export default router;
