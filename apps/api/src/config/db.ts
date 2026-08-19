import mongoose from "mongoose";
import { env } from "./env";

function redactedUri(uri: string) {
  return uri.replace(/\/\/([^@]+)@/, "//***@");
}

export async function connectDb() {
  mongoose.set("strictQuery", true);
  console.log(`Connecting to MongoDB: ${redactedUri(env.mongodbUri)}`);
  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 8000,
  });
  console.log("MongoDB connected");
}

export async function connectDbWithRetry() {
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      await connectDb();
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err);
      await new Promise((resolve) => setTimeout(resolve, Math.min(3000 * attempt, 15000)));
    }
  }
}
