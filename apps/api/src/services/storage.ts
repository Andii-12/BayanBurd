import fs from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";
import { AppError } from "../utils/http";

const localDir = path.resolve(process.cwd(), "uploads");

let client: S3Client | null = null;

function r2() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: env.storageEndpoint,
      credentials: {
        accessKeyId: env.storageAccessKey,
        secretAccessKey: env.storageSecretKey,
      },
    });
  }
  return client;
}

function bucketFor(folder: string) {
  if (folder === "issues") return env.storageBucketIssues;
  return env.storageBucketProducts;
}

function publicBaseFor(folder: string) {
  const base = (folder === "issues" ? env.storagePublicUrlIssues : env.storagePublicUrlProducts).replace(/\/+$/, "");
  if (!base) {
    throw new AppError(
      400,
      folder === "issues"
        ? "STORAGE_PUBLIC_URL_ISSUES тохируулаагүй. issueimages bucket-ийн Public Development URL-ийг оруулна уу."
        : "STORAGE_PUBLIC_URL_PRODUCTS тохируулаагүй. productimages bucket-ийн Public Development URL-ийг оруулна уу."
    );
  }
  return base;
}

function objectKey(file: Express.Multer.File) {
  const ext = path.extname(file.originalname || "").replace(/[^.a-zA-Z0-9]/g, "").slice(0, 8) || ".bin";
  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
}

export async function saveFile(file: Express.Multer.File, folder = "uploads") {
  const key = objectKey(file);
  if (env.storageDriver === "r2") {
    const bucket = bucketFor(folder);
    if (!bucket || !env.storageEndpoint || !env.storageAccessKey || !env.storageSecretKey) {
      throw new AppError(
        400,
        "R2 тохиргоо дутуу. STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY болон bucket нэрс шаардлагатай."
      );
    }
    await r2().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return {
      url: `${publicBaseFor(folder)}/${key}`,
      key,
      mime: file.mimetype,
      size: file.size,
      name: file.originalname,
    };
  }
  const dest = path.join(localDir, folder);
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, key), file.buffer);
  return {
    url: `${env.apiUrl}/uploads/${folder}/${key}`,
    key,
    mime: file.mimetype,
    size: file.size,
    name: file.originalname,
  };
}
