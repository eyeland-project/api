import { Request, Response, NextFunction } from "express";
import * as releaseService from "../../services/release.service";
import { Release, ReleaseCreation } from "../../types/Release.types";
import { ApiError } from "../../middlewares/handleErrors";

export async function getLatestRelease(
  _: Request,
  res: Response<Release>,
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
  res: Response<Release>,
  next: NextFunction
) {
  const version = req.params.version;
  try {
    res.status(200).json(await releaseService.getVersionRelease(version));
  } catch (err) {
    next(err);
  }
}

export async function getRelease(
  req: Request<{ idRelease: string }>,
  res: Response<Release>,
  next: NextFunction
) {
  const { idRelease: idReleaseStr } = req.params;
  try {
    const idRelease = parseInt(idReleaseStr);
    if (isNaN(idRelease)) {
      throw new ApiError("Invalid idRelease", 400);
    }
    res.status(200).json(await releaseService.getRelease(idRelease));
  } catch (err) {
    next(err);
  }
}

export async function getReleases(
  _: Request,
  res: Response<Release[]>,
  next: NextFunction
) {
  try {
    res.status(200).json(await releaseService.getReleases());
  } catch (err) {
    next(err);
  }
}

export async function createRelease(
  req: Request<any, any, ReleaseCreation>,
  res: Response<Release>,
  next: NextFunction
) {
  // const fields = req.body as ReleaseCreation;
  try {
    if (!Object.keys(req.body).length) {
      throw new ApiError("No fields provided", 400);
    }
    res.status(201).json(await releaseService.createRelease(req.body));
  } catch (err) {
    next(err);
  }
}

export async function updateRelease(
  req: Request<{ idRelease: string }, any, Partial<ReleaseCreation>>,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { idRelease: idReleaseStr } = req.params;
  try {
    const idRelease = parseInt(idReleaseStr);
    if (isNaN(idRelease)) {
      throw new ApiError("Invalid idRelease", 400);
    }
    if (!Object.keys(req.body).length) {
      throw new ApiError("No fields provided", 400);
    }
    await releaseService.updateRelease(idRelease, req.body);
    res.status(200).json({ message: "Release updated successfully" });
  } catch (err) {
    next(err);
  }
}

export async function deleteRelease(
  req: Request<{ idRelease: string }>,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  const { idRelease: idReleaseStr } = req.params;
  try {
    const idRelease = parseInt(idReleaseStr);
    if (isNaN(idRelease)) {
      throw new ApiError("Invalid idRelease", 400);
    }
    await releaseService.deleteRelease(idRelease);
    res.status(200).json({ message: "Release deleted successfully" });
  } catch (err) {
    next(err);
  }
}
