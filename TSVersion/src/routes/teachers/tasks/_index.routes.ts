import { Router } from "express";
import passport from "passport";
import { getTask, getTasks } from "@controllers/teacher/task.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router();
router.use(auth);

router.get("/", getTasks);
router.get("/:idTask", getTask);

export default router;
