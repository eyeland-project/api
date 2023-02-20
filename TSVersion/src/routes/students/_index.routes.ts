import { Router } from "express";
import { login } from '../../controllers/students/auth.controller';

const router = Router();

router.get('/', (_, res) => { res.status(200).json({ message: 'Welcome to the Students API' }); });
router.post('/login', login);

export default router;
