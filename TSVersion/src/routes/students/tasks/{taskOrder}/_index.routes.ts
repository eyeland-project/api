import { Router } from "express";
import passport from "passport";
import { getIntro, getProgress } from '../../../../controllers/students/task.controller';

const auth = passport.authenticate('jwt', { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get('/introduction', getIntro);
router.get('/progress', getProgress);

export default router;
