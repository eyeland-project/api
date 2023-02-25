import { Router } from "express";
import passport from "passport";
import { getTeams, joinTeam, leaveTeam, reqPower } from '../../../controllers/students/team.controller';

const auth = passport.authenticate('jwt-student', { session: false });

const router = Router();
router.use(auth);

router.get('/', getTeams);
router.post('/', joinTeam);
router.put('/', leaveTeam);
router.post('/power', reqPower);

export default router;
