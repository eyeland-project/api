import { Router } from "express";
import { login, whoami } from '../../controllers/students/auth.controller';
import passport from "passport";

const router = Router();

router.get('/', (_, res) => { res.status(200).json({ message: 'Welcome to the Students API' }); });
router.post('/login', login);
router.get('/whoami', passport.authenticate('jwt-student', { session: false }), whoami);

export default router;
