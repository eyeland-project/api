import { Router } from "express";
import passport from "passport";
import { getPostask } from "@controllers/teacher/taskStage.controller";
import { getPostaskQuestions } from "@controllers/teacher/question.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getPostask);
router.get("/questions", getPostaskQuestions);

export default router;
