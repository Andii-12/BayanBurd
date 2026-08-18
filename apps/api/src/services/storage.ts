import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";

const localDir = path.resolve(process.cwd(), "uploads");

function r2() {
  return new S3Client({
    region: "auto",
    endpoint: env.storageEndpoint,
    credentials: {
      accessKeyId: env.storageAccessKey,
      secretAccessKey: env.storageSecretKey,
    },
  });
}

export async function saveFile(file: Express.Multer.File, folder = "uploads") {
  const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
  if (env.storageDriver === "r2" && env.storageBucket) {
    await r2().send(
      new PutObjectCommand({
        Bucket: env.storageBucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    const base = env.storagePublicUrl || env.storageEndpoint;
    return { url: `${base}/${key}`, key, mime: file.mimetype, size: file.size, name: file.originalname };
  }
  const dest = path.join(localDir, folder);
  fs.mkdirSync(dest, { recursive: true });
  const filename = path.basename(key);
  fs.writeFileSync(path.join(dest, filename), file.buffer);
  return {
    url: `${env.apiUrl}/uploads/${folder}/${filename}`,
    key,
    mime: file.mimetype,
    size: file.size,
    name: file.originalname,
  };
}
