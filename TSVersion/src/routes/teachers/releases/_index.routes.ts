import { Router } from "express";
import {
  getLatestRelease,
  getVersionRelease,
  getReleases,
  createRelease,
  updateRelease,
  deleteRelease,
  getRelease
} from "../../../controllers/teachers/release.controller";

const router = Router();

router.get("/latest", getLatestRelease);
router.get("/v/:version", getVersionRelease);
router.get("/:idRelease", getRelease);
router.get("/", getReleases);
router.post("/", createRelease);
router.put("/:idRelease", updateRelease);
router.delete("/:idRelease", deleteRelease);

export default router;
