import { Router } from "express";
import { getIntro, start } from '../../../../controllers/students/task.controller';

const router: Router = Router({ mergeParams: true });

router.get('/introduction', getIntro);
router.post('/start', start);

export default router;
