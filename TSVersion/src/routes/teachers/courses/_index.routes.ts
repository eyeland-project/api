import { Router } from "express";
import passport from "passport";
import {
  getCourses,
  createCourse
} from "@controllers/teacher/course.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router();
router.use(auth);

router.get("/", getCourses);
router.post("/", createCourse);

export default router;
