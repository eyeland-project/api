import { Router } from "express";
import passport from "passport";
import { getPretask } from "@controllers/teacher/taskStage.controller";
import { getPretaskQuestions } from "@controllers/teacher/question.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getPretask);
router.get("/questions", getPretaskQuestions);

export default router;
