import multer, { memoryStorage } from "multer";
import { promisify } from "util";

export function uploadFile(fieldName: string, fileSize?: number) {
  return promisify(
    multer({
      storage: memoryStorage(),
      limits: { fileSize: fileSize ?? 5 * 1024 * 1024 }
    }).single(fieldName)
  );
}
