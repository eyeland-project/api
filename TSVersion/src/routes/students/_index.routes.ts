import { Router } from "express";
import { login, whoami } from "@controllers/student/auth.controller";
import passport from "passport";
import { incrementCounter } from "@utils";

const router = Router();

router.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome to the Students API" });
});
router.post("/login", login);
router.get(
  "/whoami",
  passport.authenticate("jwt-student", { session: false }),
  whoami
);
router.get("/counter", (_, res) => {
  res.status(200).json({ counter: incrementCounter() });
});

export default router;
