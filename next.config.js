/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
    // Windows에서 빠른 새로고침 최적화
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled'
  ],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Windows 호환성을 위해 SWC 비활성화
  swcMinify: false,
  compiler: {
    emotion: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  poweredByHeader: false,
  reactStrictMode: true, // 개발 중 Strict Mode 비활성화
};

module.exports = nextConfig;
