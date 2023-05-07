import { RequestHandler, Router } from "express";
import {
  answer,
  getQuestions,
  getPostask
} from "@controllers/student/postask.controller";
import passport from "passport";

const auth: RequestHandler = passport.authenticate("jwt-student", {
  session: false
});

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getPostask);
router.get("/questions", getQuestions);
router.post("/questions/:questionOrder", answer);

export default router;
