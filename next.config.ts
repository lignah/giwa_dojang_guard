import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone / LAN access in `next dev` (blocks cross-origin _next assets otherwise)
  allowedDevOrigins: [
    "http://192.168.45.176:3456",
    "192.168.45.176",
    "http://192.168.45.176",
    "127.0.0.1",
    "localhost",
  ],
};

export default nextConfig;
