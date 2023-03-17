import { Router } from "express";
import { login } from "../../controllers/teachers/auth.controller";
import { incrementCounter } from "../../utils";

const router = Router();

router.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome to the Teachers API" });
});
router.post("/login", login);
router.get("/counter", (_, res) => {
  res.status(200).json({ counter: incrementCounter() });
});

export default router;
