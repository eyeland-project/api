import { Router } from "express";
import { login } from "@controllers/teacher/auth.controller";
import { incrementCounter } from "@utils";
import { getInstitution } from "@controllers/teacher/institution.controller";
import passport from "passport";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router();

router.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome to the Teachers API" });
});
router.post("/login", login);
router.get("/counter", (_, res) => {
  res.status(200).json({ counter: incrementCounter() });
});
router.get("/institution", auth, getInstitution);

export default router;
