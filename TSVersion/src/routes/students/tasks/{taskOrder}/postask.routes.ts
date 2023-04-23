import { RequestHandler, Router } from "express";
import {
  answer,
  getQuestion,
  getPostask
} from "@controllers/student/postask.controller";
import passport from "passport";

const auth: RequestHandler = passport.authenticate("jwt-student", {
  session: false
});

const router = Router({ mergeParams: true });
router.use(auth);

router.get("/", getPostask);
router.get("/questions/:questionOrder", getQuestion);
router.post("/questions/:questionOrder", answer);

export default router;
