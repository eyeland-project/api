import { Router } from "express";
import { login } from "@controllers/admin/auth.controller";
import passport from "passport";

const router = Router();

router.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome to the Admins API" });
});
router.post("/login", login);

export default router;
