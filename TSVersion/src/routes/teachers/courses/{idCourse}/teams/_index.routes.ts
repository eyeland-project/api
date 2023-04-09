import { Router } from "express";
import passport from "passport";
import {
  getTeams,
  getTeam,
  updateTeam,
  initTeams
} from "../../../../../controllers/teachers/team.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getTeams);
router.get("/:idTeam", getTeam);
router.put("/:idTeam", updateTeam);
router.post("/init", initTeams);

export default router;
