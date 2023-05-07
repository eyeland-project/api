import { Router } from "express";
import passport from "passport";
import {
  answer,
  getNextQuestion,
  getDuringtask
} from "@controllers/student/duringtask.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getDuringtask);
router.get("/questions/next", getNextQuestion);
router.post("/questions/:questionOrder", answer);

export default router;
