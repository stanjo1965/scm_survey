/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
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
  swcMinify: true,
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
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  // Windows 환경에서 빌드 안정성 향상
  outputFileTracing: false,
  poweredByHeader: false,
};

module.exports = nextConfig;