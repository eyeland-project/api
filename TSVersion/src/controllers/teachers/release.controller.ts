import { Request, Response, NextFunction } from "express";
import * as releaseService from "../../services/release.service";
import { projectId } from "../../storage/cloudStorage";

export async function getLatestRelease(
  _: Request,
  res: Response<{ url: string } | { message: string }>,
  next: NextFunction
) {
  try {
    const file = await releaseService.getLatestRelease();
    res.json({
      url: `https://storage.cloud.google.com/${projectId}/${file.name}`
    });
  } catch (err) {
    next(err);
  }
}

export async function getVersionRelease(
  req: Request<{ version: string }>,
  res: Response<{ url: string } | { message: string }>,
  next: NextFunction
) {
  const version = req.params.version;
  try {
    const file = await releaseService.getRelease(version);
    res.json({
      url: `https://storage.cloud.google.com/${projectId}/${file.name}`
    });
  } catch (err) {
    next(err);
  }
}
