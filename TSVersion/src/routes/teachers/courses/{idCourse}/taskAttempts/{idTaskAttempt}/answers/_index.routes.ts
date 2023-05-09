import {
  getAnswersFromPretask,
  getAnswersFromDuringtask,
  getAnswersFromPostask
} from "@controllers/teacher/answer.controller";
import { Router } from "express";
import passport from "passport";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/pretask", getAnswersFromPretask);
router.get("/duringtask", getAnswersFromDuringtask);
router.get("/postask", getAnswersFromPostask);

export default router;
