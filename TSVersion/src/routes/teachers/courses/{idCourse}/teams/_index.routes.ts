import { Router } from "express";
import passport from "passport";
import {
  getTeams,
  getTeam,
  initTeams
} from "@controllers/teacher/team.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getTeams);
router.get("/:idTeam", getTeam);
router.post("/init", initTeams);

export default router;
