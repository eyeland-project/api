import { Router } from "express";
import passport from "passport";
import {
  getIntro,
  getProgress,
  finishAttempt
} from "@controllers/student/task.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/introduction", getIntro);
router.get("/progress", getProgress);
router.delete("/attempt", finishAttempt);

export default router;
