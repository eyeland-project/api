import { getTaskAttempt } from "@controllers/teacher/taskAttempt.controller";
import { Router } from "express";
import passport from "passport";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getTaskAttempt);

export default router;
