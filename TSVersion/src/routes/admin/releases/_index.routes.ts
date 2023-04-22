import { Router } from "express";
import {
  createRelease,
  updateRelease,
  deleteRelease
} from "@controllers/admin/release.controller";
import passport from "passport";

const auth = passport.authenticate("jwt-admin", { session: false });

const router = Router();
router.use(auth);

router.post("/", createRelease);
router.put("/:idRelease", updateRelease);
router.delete("/:idRelease", deleteRelease);

export default router;
