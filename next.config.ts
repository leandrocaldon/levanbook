import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  transpilePackages: ["page-flip"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "9h6458bn.us-east.insforge.app",
      },
    ],
  },
};

export default nextConfig;
