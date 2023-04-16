import { Storage } from "@google-cloud/storage";

let storage: Storage | undefined = undefined;

export const projectId = process.env.CLOUD_STORAGE_PROJECT_ID;

export function authCloudStorage() {
  if (!projectId) {
    throw new Error("CLOUD_STORAGE_PROJECT_ID is not defined");
  }
  storage = new Storage({ projectId });
}

export function getStorageBucket() {
  if (!storage) {
    throw new Error("Storage is not defined");
  }
  const bucketName = process.env.CLOUD_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error("CLOUD_STORAGE_BUCKET is not defined");
  }
  return storage.bucket(bucketName);
}

export function getStorage() {
  return storage;
}
