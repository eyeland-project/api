import { Router } from "express";
import passport from "passport";
import { getTeams, joinTeam, leaveTeam, reqPower, ready, reroll, getCurrentTeam } from '../../../controllers/students/team.controller';

const auth = passport.authenticate('jwt-student', { session: false });

const router = Router();
router.use(auth);

router.get('/', getTeams);
router.post('/', joinTeam);
router.put('/', leaveTeam);
router.put('/current/reroll', reroll);
router.post('/current/ready', ready);
router.post('/current/req-power', reqPower);
router.get('/current', getCurrentTeam);

export default router;
