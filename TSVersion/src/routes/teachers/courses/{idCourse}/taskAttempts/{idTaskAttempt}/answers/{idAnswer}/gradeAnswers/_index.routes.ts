import {
  createGradeAnswer,
  deleteGradeAnswer,
  updateGradeAnswer
} from "@controllers/teacher/gradeAnswer.controller";
import { Router } from "express";
import passport from "passport";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.post("/", createGradeAnswer);
router.put("/:idGradeAnswer", updateGradeAnswer);
router.delete("/:idGradeAnswer", deleteGradeAnswer);

export default router;
