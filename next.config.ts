import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow your local network IP to execute Server Actions
      allowedOrigins: ["localhost:3000", "192.168.0.5:3000"],
    },
  },
};

export default nextConfig;
