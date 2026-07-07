import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@eduspell/ui', '@eduspell/auth', '@eduspell/shared'],
};

export default nextConfig;
