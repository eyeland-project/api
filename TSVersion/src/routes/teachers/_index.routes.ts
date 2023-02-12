import { Router } from "express";
import { login } from '../../controllers/teachers/auth.controller';

const router = Router();

router.get('/', (_, res) => { res.status(200).json({ message: 'Welcome to the Teachers API' }); });
router.post('/login', login);

export default router;
