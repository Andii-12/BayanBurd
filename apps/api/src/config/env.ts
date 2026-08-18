import dotenv from "dotenv";
import path from "path";

const envFiles = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), "apps/api/.env"),
  path.resolve(process.cwd(), ".env"),
];
for (const file of envFiles) {
  dotenv.config({ path: file });
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bayan_burd_eternity",
  jwtSecret: process.env.JWT_SECRET || "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  apiUrl: process.env.API_URL || "http://localhost:4000",
  storageDriver: (process.env.STORAGE_DRIVER || "local") as "local" | "r2",
  storageEndpoint: process.env.STORAGE_ENDPOINT || "",
  storageBucket: process.env.STORAGE_BUCKET || "",
  storageBucketIssues: process.env.STORAGE_BUCKET_ISSUES || process.env.STORAGE_BUCKET || "issueimages",
  storageBucketProducts: process.env.STORAGE_BUCKET_PRODUCTS || process.env.STORAGE_BUCKET || "productimages",
  storageAccessKey: process.env.STORAGE_ACCESS_KEY || "",
  storageSecretKey: process.env.STORAGE_SECRET_KEY || "",
  storagePublicUrl: process.env.STORAGE_PUBLIC_URL || "",
  storagePublicUrlIssues: process.env.STORAGE_PUBLIC_URL_ISSUES || process.env.STORAGE_PUBLIC_URL || "",
  storagePublicUrlProducts: process.env.STORAGE_PUBLIC_URL_PRODUCTS || process.env.STORAGE_PUBLIC_URL || "",
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB || 15),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || process.env.RESEND_FROM || "Bayan Burd Eternity <noreply@eternity.mn>",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFrom: process.env.RESEND_FROM || process.env.SMTP_FROM || "Bayan Burd Eternity <onboarding@resend.dev>",
};
