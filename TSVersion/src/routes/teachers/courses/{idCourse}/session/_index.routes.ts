import { Router } from "express";
import passport from "passport";
import {
  createSession,
  startSession,
  endSession
} from "@controllers/teacher/course.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.post("/", createSession);
router.post("/start", startSession);
router.put("/end", endSession);

export default router;
