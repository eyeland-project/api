import { Router } from "express";
import passport from "passport";
import {
  getPretask,
  getQuestion,
  answer,
  setCompleted,
  getQuestions
} from "@controllers/student/pretask.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getPretask);
router.get("/questions", getQuestions);
router.get("/questions/:questionOrder", getQuestion);
router.post("/questions/:questionOrder", answer);
router.post("/complete", setCompleted);

export default router;
