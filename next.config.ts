import type { NextConfig } from "next";
import path from "path";

// Use absolute path for better compatibility with both webpack and turbopack
const emptyModule = path.resolve(__dirname, "stubs/empty-module.ts");

const nextConfig: NextConfig = {
  // Turbopack is default in Next 16; mirror aliases for both bundlers
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": emptyModule,
      "pino-pretty": emptyModule,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": emptyModule,
      "pino-pretty": emptyModule,
    };
    return config;
  },
};

export default nextConfig;
