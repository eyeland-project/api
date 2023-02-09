import { Router } from "express";
import {
    answer,
    getQuestion,
    getQuestions,
    root
} from '../../../../controllers/students/postask.controller';

const router = Router({ mergeParams: true });

router.get('/', root);
router.get('/questions', getQuestions);
router.get('/questions/:questionOrder', getQuestion);
router.post('/questions/:questionOrder', answer);

export default router;
