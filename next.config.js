/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  experimental: {
    appDir: true
  },
  typescript: {
    // ⚠️ 仅在生产构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
