/** @type {import('next').NextConfig} */
const path = require('path');

async function initSupabase() {
  try {
    // lib/supabase.ts 실행
    console.log("Supabase 초기화 중...");
    const { createTables } = await import(path.join(__dirname, "lib/supabase.ts"));
    await createTables();
  } catch (err) {
    console.error("❌ Supabase 초기화 실패:", err);
  }
}

// 빌드 시작 시점 실행
initSupabase();

const nextConfig = {
  // Windows 환경 최적화
  experimental: {
    esmExternals: 'loose',
    // Windows에서 빠른 새로고침 최적화
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    // Windows 파일 시스템 안정성 향상
    serverComponentsExternalPackages: [],
    appDir: true
  },
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled'
  ],
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Windows 환경에서 파일 시스템 최적화
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 3000, // 파일 변경 감지 간격 더 증가
        aggregateTimeout: 1000, // 변경 감지 후 대기 시간 증가
        ignored: ['**/node_modules/**', '**/.next/**', '**/dist/**'], // 더 많은 디렉토리 무시
      };
      
      // Windows에서 파일 경로 문제 해결
      config.snapshot = {
        managedPaths: [],
        immutablePaths: [],
        buildDependencies: {
          hash: true,
          timestamp: true,
        },
      };
      
      // Windows 파일 시스템 캐시 설정 - 절대 경로 사용
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'), // 절대 경로로 수정
      };
    }
    
    // 개발 환경에서 빌드 최적화
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
        // Windows에서 안정성을 위해 추가
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }
    
    return config;
  },
  // Windows 호환성을 위해 SWC 비활성화
  swcMinify: false,
  compiler: {
    emotion: true,
  },
  images: {
    domains: [
      'example.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Windows 환경에서 더 안정적인 설정
  onDemandEntries: {
    maxInactiveAge: 180 * 1000, // 3분으로 증가
    pagesBufferLength: 5, // 버퍼 크기 감소
  },
  // 개발 서버 성능 최적화
  devIndicators: {
    buildActivity: false, // 빌드 인디케이터 비활성화
    buildActivityPosition: 'bottom-right',
  },
  // TypeScript 설정 최적화
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true, // 빌드 시 ESLint 무시
  },
  // Windows 환경에서 파일 시스템 안정성
  outputFileTracing: false, // 파일 추적 비활성화
  poweredByHeader: false,
  reactStrictMode: true, // 개발 중 Strict Mode 비활성화
};

module.exports = nextConfig;