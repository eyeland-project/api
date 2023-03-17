import { Router } from "express";
import passport from "passport";
import {
  answer,
  getQuestion,
  root
} from "../../../../controllers/students/duringtask.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", root);
router.get("/questions/:questionOrder", getQuestion);
router.post("/questions/:questionOrder", answer);

export default router;
