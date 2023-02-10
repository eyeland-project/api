import { Router } from "express";
import {
    answer,
    getQuestion,
    getQuestions,
    root
} from '../../../../controllers/students/postask.controller';
import passport from "passport";

const auth = passport.authenticate('jwt', { session: false });

const router = Router({ mergeParams: true });
// router.use(auth);

router.get('/', root);
router.get('/questions', getQuestions);
router.get('/questions/:questionOrder', getQuestion);
router.post('/questions/:questionOrder', answer);

export default router;
