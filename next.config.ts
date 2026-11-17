import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  compiler: {
    reactRemoveProperties: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**", pathname: "**" }],
  },
};

export default nextConfig;
