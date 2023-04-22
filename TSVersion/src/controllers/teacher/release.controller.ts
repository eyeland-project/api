import { Request, Response, NextFunction } from "express";
import * as releaseService from "@services/release.service";
import { ApiError } from "@middlewares/handleErrors";
import { ReleaseDetailDto, ReleaseSummaryDto } from "@dto/teacher/release.dto";

export async function getLatestRelease(
  _: Request,
  res: Response<ReleaseDetailDto>,
  next: NextFunction
) {
  try {
    res.status(200).json(await releaseService.getLatestRelease());
  } catch (err) {
    next(err);
  }
}

export async function getVersionRelease(
  req: Request<{ version: string }>,
  res: Response<ReleaseDetailDto>,
  next: NextFunction
) {
  const { version } = req.params;
  try {
    res.status(200).json(await releaseService.getVersionRelease(version));
  } catch (err) {
    next(err);
  }
}

export async function getRelease(
  req: Request<{ idRelease: string }>,
  res: Response<ReleaseDetailDto>,
  next: NextFunction
) {
  try {
    const idRelease = parseInt(req.params.idRelease);
    if (isNaN(idRelease) || idRelease <= 0) {
      throw new ApiError("Invalid idRelease", 400);
    }
    res.status(200).json(await releaseService.getRelease(idRelease));
  } catch (err) {
    next(err);
  }
}

export async function getReleases(
  _: Request,
  res: Response<ReleaseSummaryDto[]>,
  next: NextFunction
) {
  try {
    res.status(200).json(await releaseService.getReleases());
  } catch (err) {
    next(err);
  }
}
