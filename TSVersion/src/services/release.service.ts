import { File } from "@google-cloud/storage";
import { ApiError } from "../middlewares/handleErrors";
import { getStorageBucket } from "../storage/cloudStorage";

export async function getAllReleases(): Promise<File[]> {
  let files = await getFiles({
    prefix: "app/dist/v/",
    ext: ".apk"
  });
  if (!files.length) {
    files = await getFiles({ ext: ".apk" });
  }
  return files;
}

export async function getLatestRelease(files?: File[]): Promise<File> {
  if (!files) files = await getAllReleases();
  if (!files.length) throw new ApiError("No releases exist", 500);

  let latest: File | null = null;

  // files.forEach((file) => {
  //   const version = getFileVersion(file);
  //   if (!latestVersion) {
  //     updateLatest(file, version);
  //   } else {
  //     const compare = version.localeCompare(latestVersion);
  //     if (compare > 0) {
  //       updateLatest(file, version);
  //     } else if (compare === 0) {
  //       let fileDate = file.metadata.timeCreated;
  //       let latestDate = latest!.metadata.timeCreated;
  //       if (fileDate !== undefined && latestDate !== undefined) {
  //         if (new Date(fileDate) > new Date(latestDate)) {
  //           updateLatest(file, version);
  //         }
  //       }
  //     }
  //   }
  // });

  files.forEach((file) => {
    if (!latest || compareFileVersions(file, latest) > 0) {
      latest = file;
    }
  });

  if (!latest) latest = files[0];
  return latest;
}

export async function getRelease(version: string): Promise<File> {
  const files = (await getAllReleases()).filter(
    (file) => getFileVersion(file) === version
  );
  if (!files.length)
    throw new ApiError("No release with that version exists", 404);
  return await getLatestRelease(files);
}

function compareFileVersions(f1: File, f2: File): number {
  const v1 = getFileVersion(f1);
  const v2 = getFileVersion(f2);
  const compare = v1.localeCompare(v2);
  if (
    compare !== 0 ||
    f1.metadata.timeCreated === undefined ||
    f2.metadata.timeCreated === undefined
  )
    return compare;
  const date1 = new Date(f1.metadata.timeCreated);
  const date2 = new Date(f2.metadata.timeCreated);
  return date1 > date2 ? 1 : date1 < date2 ? -1 : 0;
}

function getFileVersion(file: File): string {
  const match = file.name.match(/\d(\.\d)*/);
  if (!match) throw new ApiError("Invalid file name", 500);
  return match[0];
}

async function getFiles({
  prefix,
  ext
}: {
  prefix?: string;
  ext?: string;
}): Promise<File[]> {
  let [files] = await getStorageBucket().getFiles({ prefix });

  if (ext !== undefined) {
    files = files.filter((file) => file.name.endsWith(ext));
  }

  return files;
}
