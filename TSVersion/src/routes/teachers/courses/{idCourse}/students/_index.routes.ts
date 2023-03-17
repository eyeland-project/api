import { Router } from "express";
import passport from "passport";

const auth = passport.authenticate("jwt-teacher", { session: false });

const router = Router({ mergeParams: true });
router.use(auth);

// router.get('/', );

export default router;
