import { Router } from "express";
import { root } from '../../../controllers/students/task.controller';

const router: Router = Router();

router.get('/', root);

export default router;
