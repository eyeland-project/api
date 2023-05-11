import { Router } from "express";
import passport from "passport";
import {
  deleteCourse,
  getCourse,
  updateCourse
} from "@controllers/teacher/course.controller";
import { getTaskAttemptSubmissions } from "@controllers/teacher/taskAttempt.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getCourse);
router.put("/", updateCourse);
router.delete("/", deleteCourse);
router.get("/submissions", getTaskAttemptSubmissions);

export default router;
