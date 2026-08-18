import multer from "multer";
import { env } from "../config/env";
import { AppError } from "../utils/http";

const images = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const allowed = new Set([
  ...images,
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

function makeUpload(types: Set<string>) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: env.uploadMaxMb * 1024 * 1024, files: 8 },
    fileFilter: (_req, file, cb) => {
      if (!types.has(file.mimetype)) {
        cb(new AppError(400, "Файлын төрөл зөвшөөрөгдөөгүй"));
        return;
      }
      cb(null, true);
    },
  });
}

export const upload = makeUpload(allowed);
export const uploadImages = makeUpload(images);
