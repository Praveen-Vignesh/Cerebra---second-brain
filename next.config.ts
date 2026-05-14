import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow your local network IP to execute Server Actions
      allowedOrigins: ["192.168.0.6:3000", "192.168.0.3:3000"],
    },
  },
};

export default nextConfig;
