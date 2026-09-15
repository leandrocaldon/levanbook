import type { NextConfig } from "next";
import { getInsForgeImageHostname, getInsForgePublicOrigin } from "./src/lib/insforge/url";

const insforgeOrigin = getInsForgePublicOrigin();
const insforgeHost = getInsForgeImageHostname();

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  // InsForge storage uploads use presigned S3 URLs and downloads use its CDN.
  `connect-src 'self' blob:${insforgeOrigin ? ` ${insforgeOrigin}` : ""} https://*.amazonaws.com https://cdn.insforge.dev`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  transpilePackages: ["page-flip"],
  images: {
    remotePatterns: insforgeHost
      ? [
          {
            protocol: "https",
            hostname: insforgeHost,
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
