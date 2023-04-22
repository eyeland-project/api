import { Router } from "express";
import {
  getLatestRelease,
  getVersionRelease,
  getReleases,
  getRelease
} from "@controllers/teacher/release.controller";

const router = Router();

router.get("/latest", getLatestRelease);
router.get("/v/:version", getVersionRelease);
router.get("/:idRelease", getRelease);
router.get("/", getReleases);

export default router;
