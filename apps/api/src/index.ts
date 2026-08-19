import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { env, corsOrigins } from "./config/env";
import { connectDbWithRetry } from "./config/db";
import { errorHandler } from "./utils/http";
import authRoutes from "./routes/auth";
import catalogRoutes from "./routes/catalog";
import orderRoutes from "./routes/orders";
import assetRoutes from "./routes/assets";
import issueRoutes from "./routes/issues";
import installationRoutes from "./routes/installations";
import quotationRoutes from "./routes/quotations";
import notificationRoutes from "./routes/notifications";
import searchRoutes from "./routes/search";
import documentRoutes from "./routes/documents";
import adminRoutes from "./routes/admin";
import dashboardRoutes from "./routes/dashboard";

async function main() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  app.get("/api/health", (_req, res) => res.json({ ok: true, name: "Bayan Burd Eternity API" }));
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 800,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use("/api/auth", authRoutes);
  app.use("/api", catalogRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/assets", assetRoutes);
  app.use("/api/issues", issueRoutes);
  app.use("/api/installations", installationRoutes);
  app.use("/api/quotations", quotationRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api", documentRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(errorHandler);

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(env.port, "0.0.0.0", () => {
      console.log(`API listening on 0.0.0.0:${env.port}`);
      console.log(
        `Email: ${env.resendApiKey ? `Resend from ${env.resendFrom}` : env.smtpHost ? "SMTP" : "disabled (no RESEND_API_KEY)"}`
      );
      resolve();
    });
    server.on("error", reject);
  });

  await connectDbWithRetry();
}

main().catch((err) => {
  console.error(err);
  if (String(err?.message || err).includes("ECONNREFUSED") || String(err?.name) === "MongooseServerSelectionError") {
    console.error("\nMongoDB is not running. Start it first:\n  docker compose up -d\n  or install / start local MongoDB on port 27017.\n");
  }
  process.exit(1);
});
