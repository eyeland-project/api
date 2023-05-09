import { Router } from "express";
import passport from "passport";
import { getTask } from "@controllers/teacher/task.controller";
import { getTaskStages } from "@controllers/teacher/taskStage.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getTask);
router.get("/taskStages", getTaskStages);

export default router;
