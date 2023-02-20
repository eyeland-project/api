import { Router } from "express";
import passport from "passport";
import { getTeams, joinTeam, leaveTeam } from '../../../controllers/students/team.controller';

const auth = passport.authenticate('jwt', { session: false });

const router = Router();
router.use(auth);

router.get('/', getTeams);
router.post('/', joinTeam);
router.put('/', leaveTeam);

export default router;
