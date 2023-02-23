import { Router } from "express";
import passport from "passport";
import { getTeams, getTeam, updateTeam } from "../../../../../controllers/teachers/team.controller";

const auth = passport.authenticate('jwt', { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get('/', getTeams);
router.get('/:idTeam', getTeam);
router.put('/:idTeam', updateTeam);

export default router;
