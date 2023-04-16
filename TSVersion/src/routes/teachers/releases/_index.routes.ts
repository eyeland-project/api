import { Router } from "express";
import {
  getLatestRelease,
  getVersionRelease
} from "../../../controllers/teachers/release.controller";

const router = Router();

router.get("/latest", getLatestRelease);
router.get("/v/:version", getVersionRelease);

export default router;
