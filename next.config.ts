import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    // Ignore test files
    config.resolve.alias = {
      ...config.resolve.alias,
      'why-is-node-running': false,
    }
    
    return config
  },
  // Transpile these packages
  transpilePackages: ['@walletconnect/ethereum-provider'],
};

export default nextConfig;