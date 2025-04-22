import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "**" },
      //{ protocol: 'http', hostname: 'test.en.feejoy.com:35333', pathname: '**' },
    ],
  },
};

export default nextConfig;
