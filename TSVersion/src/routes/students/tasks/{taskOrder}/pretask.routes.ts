import { Router } from "express";
import {
    root,
    getQuestion,
    getQuestions,
    answer,
    getLink,
    getLinks
} from '../../../../controllers/students/pretask.controller';

const router = Router({ mergeParams: true });

router.get('/', root);
router.get('/links', getLinks);
router.get('/links/:linkOrder', getLink);
router.get('/questions', getQuestions);
router.get('/questions/:questionOrder', getQuestion);
router.post('/questions/:questionOrder', answer);

export default router;
