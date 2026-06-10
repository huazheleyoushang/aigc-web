import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["react-markdown", "highlight.js"],
  },
};

export default nextConfig;
