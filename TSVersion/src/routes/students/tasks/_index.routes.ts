import { Router } from "express";
import passport from "passport";
import { getTasks } from "@controllers/student/task.controller";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getTasks);

export default router;
