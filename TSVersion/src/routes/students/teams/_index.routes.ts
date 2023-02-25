import { Router } from "express";
import passport from "passport";
import { getTeams, joinTeam, leaveTeam, reqPower, ready } from '../../../controllers/students/team.controller';

const auth = passport.authenticate('jwt-student', { session: false });

const router = Router();
router.use(auth);

router.get('/', getTeams);
router.post('/', joinTeam);
router.put('/', leaveTeam);
router.post('/current/req-power', reqPower);
router.post('/current/ready', ready);

export default router;
