import { Router } from "express";
import passport from "passport";
import {
  getPretask,
  answer,
  setCompleted,
  getQuestions
} from "@controllers/student/pretask.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getPretask);
router.get("/questions", getQuestions);
router.post("/questions/:questionOrder", answer);
router.post("/complete", setCompleted);

export default router;
