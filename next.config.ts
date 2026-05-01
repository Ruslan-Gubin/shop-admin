import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  compiler: {
    reactRemoveProperties: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**", pathname: "**" }],
  },
};

export default nextConfig;
