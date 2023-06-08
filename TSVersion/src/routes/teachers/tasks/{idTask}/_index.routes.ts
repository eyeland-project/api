import { Router } from "express";
import passport from "passport";
import { getTask } from "@controllers/teacher/task.controller";
import { getTaskStages } from "@controllers/teacher/taskStage.controller";
import { getTaskQuestions } from "@controllers/teacher/question.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getTask);
router.get("/taskStages", getTaskStages);
router.get("/questions", getTaskQuestions);

export default router;
