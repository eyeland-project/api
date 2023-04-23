import { Router } from "express";
import passport from "passport";
import { getTask } from "@controllers/teacher/task.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getTask);

export default router;
