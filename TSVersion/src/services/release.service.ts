import { ApiError } from "@middlewares/handleErrors";
import { ReleaseModel } from "@models";
import { Release, ReleaseCreation } from "@interfaces/Release.types";

export async function getLatestRelease(): Promise<Release> {
  const latest = await ReleaseModel.findOne({
    order: [["version", "DESC"]]
  });
  if (!latest) {
    throw new ApiError("Release not found", 404);
  }
  return latest;
}

export async function getVersionRelease(version: string): Promise<Release> {
  const release = await ReleaseModel.findOne({
    where: { version }
  });
  if (!release) {
    throw new ApiError("Release not found", 404);
  }
  return release;
}

export async function getRelease(idRelease: number): Promise<Release> {
  const release = await ReleaseModel.findByPk(idRelease);
  if (!release) {
    throw new ApiError("Release not found", 404);
  }
  return release;
}

export async function getReleases(): Promise<Release[]> {
  return await ReleaseModel.findAll();
}

export async function createRelease(fields: ReleaseCreation): Promise<Release> {
  return await ReleaseModel.create(fields);
}

export async function updateRelease(
  idRelease: number,
  fields: Partial<ReleaseCreation>
) {
  const result = await ReleaseModel.update(fields, {
    where: { id_release: idRelease }
  });
  if (!result[0]) {
    throw new ApiError("Release not found", 404);
  }
}

export async function deleteRelease(idRelease: number) {
  const result = await ReleaseModel.destroy({
    where: { id_release: idRelease }
  });
  if (!result) {
    throw new ApiError("Release not found", 404);
  }
}
