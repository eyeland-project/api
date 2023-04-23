import { Router } from "express";
import passport from "passport";
import { getDuringtask } from "@controllers/teacher/taskStage.controller";
import { getDuringtaskQuestions } from "@controllers/teacher/question.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getDuringtask);
router.get("/questions", getDuringtaskQuestions);

export default router;
