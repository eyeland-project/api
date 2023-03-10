import { Router } from "express";
import passport from "passport";
import { root, getQuestion, answer, getLink, setCompleted } from '../../../../controllers/students/pretask.controller';

const auth = passport.authenticate('jwt-student', { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get('/', root);
router.get('/links/:linkOrder', getLink);
router.get('/questions/:questionOrder', getQuestion);
router.post('/questions/:questionOrder', answer);
router.post('/complete', setCompleted);

export default router;
