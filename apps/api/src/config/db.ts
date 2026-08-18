import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  console.log(`Connecting to MongoDB: ${env.mongodbUri}`);
  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 8000,
  });
  console.log("MongoDB connected");
}
