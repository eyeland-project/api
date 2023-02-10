import { Router } from "express";
import { login, loginTeam, logoutTeam } from '../../controllers/students/auth.controller';

const router: Router = Router();

router.post('/login', login);
router.post('/login-team', loginTeam);
router.post('/logout-team', logoutTeam);

export default router;
