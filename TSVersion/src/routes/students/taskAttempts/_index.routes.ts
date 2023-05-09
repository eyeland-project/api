import { Router } from "express";
import passport from "passport";

const auth = passport.authenticate("jwt-student", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

export default router;
