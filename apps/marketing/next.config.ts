import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@eduspell/ui', '@eduspell/shared'],
};

export default nextConfig;
