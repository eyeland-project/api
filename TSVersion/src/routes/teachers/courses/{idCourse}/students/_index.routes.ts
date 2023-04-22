import { Router } from "express";
import passport from "passport";
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudents,
  updateStudent
} from "@controllers/teacher/student.controller";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getStudents);
router.get("/:idStudent", getStudent);
router.post("/", createStudent);
router.put("/:idStudent", updateStudent);
router.delete("/:idStudent", deleteStudent);

export default router;
