import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bbe/types", "@bbe/validation"],
  images: { remotePatterns: [{ protocol: "http", hostname: "localhost" }, { protocol: "https", hostname: "**" }] },
};

export default nextConfig;
