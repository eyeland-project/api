import { ApiError } from "@middlewares/handleErrors";
import { ReleaseModel } from "@models";
import { Release, ReleaseCreation } from "@interfaces/Release.types";
import { ReleaseDetailDto, ReleaseSummaryDto } from "@dto/teacher/release.dto";
import * as repositoryService from "@services/repository.service";

export async function getLatestRelease(): Promise<ReleaseDetailDto> {
  const { url, version, id_release, created_at } =
    await repositoryService.findOne<ReleaseModel>(ReleaseModel, {
      order: [["version", "DESC"]]
    });
  return {
    id: id_release,
    url,
    version,
    createdAt: created_at
  };
}

export async function getVersionRelease(
  version: string
): Promise<ReleaseDetailDto> {
  const { url, id_release, created_at } =
    await repositoryService.findOne<ReleaseModel>(ReleaseModel, {
      where: { version }
    });
  return {
    id: id_release,
    url,
    version,
    createdAt: created_at
  };
}

export async function getRelease(idRelease: number): Promise<ReleaseDetailDto> {
  const { url, version, created_at } =
    await repositoryService.findOne<ReleaseModel>(ReleaseModel, {
      where: { id_release: idRelease }
    });
  return {
    id: idRelease,
    url,
    version,
    createdAt: created_at
  };
}

export async function getReleases(): Promise<ReleaseSummaryDto[]> {
  return (await repositoryService.findAll<ReleaseModel>(ReleaseModel)).map(
    ({ id_release, version, url, created_at }) => ({
      id: id_release,
      version,
      url,
      createdAt: created_at
    })
  );
}
