import type { NextConfig } from "next";

const url = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null;

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    remotePatterns: url ? [{ 
      protocol: url.protocol.replace(':',''), 
      hostname: url.hostname, 
      pathname: '**' 
    }] : [] 
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        ...(config.resolve.fallback||{}), 
        fs:false, 
        child_process:false, 
        net:false, 
        tls:false, 
        module:false, 
        path:false, 
        os:false 
      };
    }
    return config;
  },
};

export default nextConfig;
