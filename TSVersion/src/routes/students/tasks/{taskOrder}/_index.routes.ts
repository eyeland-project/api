import { Router } from "express";
import passport from "passport";
import { getTask, getProgress } from "@controllers/student/task.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/introduction", getTask);
router.get("/progress", getProgress);

export default router;
