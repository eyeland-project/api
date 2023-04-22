import { Request, Response, NextFunction } from "express";
import { Release, ReleaseCreation } from "@interfaces/Release.types";
import { ApiError } from "@middlewares/handleErrors";
import { ReleaseModel } from "@models";
import * as repositoryService from "@services/repository.service";

export async function createRelease(
  req: Request<any, any, ReleaseCreation>,
  res: Response<{ id: number }>,
  next: NextFunction
) {
  try {
    const { id_release } = await repositoryService.create<ReleaseModel>(
      ReleaseModel,
      req.body
    );
    res.status(201).json({ id: id_release });
  } catch (err) {
    next(err);
  }
}

export async function updateRelease(
  req: Request<{ idRelease: string }, any, Partial<ReleaseCreation>>,
  res: Response<{ message: string }>,
  next: NextFunction
) {
  try {
    const idRelease = parseInt(req.params.idRelease);
    if (isNaN(idRelease) || idRelease <= 0) {
      throw new ApiError("Invalid idRelease", 400);
    }
    if (!Object.keys(req.body).length) {
      throw new ApiError("No fields provided", 400);
    }
    await repositoryService.update<ReleaseModel>(ReleaseModel, req.body, {
      where: { id_release: idRelease }
    });
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
  try {
    const idRelease = parseInt(req.params.idRelease);
    if (isNaN(idRelease) || idRelease <= 0) {
      throw new ApiError("Invalid idRelease", 400);
    }
    await repositoryService.destroy<ReleaseModel>(ReleaseModel, {
      where: { id_release: idRelease }
    });
    res.status(200).json({ message: "Release deleted successfully" });
  } catch (err) {
    next(err);
  }
}
