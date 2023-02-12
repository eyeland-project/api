import { Router } from "express";
import passport from "passport";
import { login, loginTeam, logoutTeam } from '../../controllers/students/auth.controller';

const auth = passport.authenticate('jwt', { session: false });

const router = Router();

router.get('/', (_, res) => { res.status(200).json({ message: 'Welcome to the Students API' }); });
router.post('/login', login);
router.post('/login-team', auth, loginTeam);
router.post('/logout-team', auth, logoutTeam);

export default router;
