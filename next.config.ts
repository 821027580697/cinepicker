/**
 * Next.js 설정 파일
 *
 * - TMDB 이미지 CDN 도메인 허용 (Next.js Image 컴포넌트)
 * - 이미지 최적화 설정 (AVIF/WebP, 디바이스별 크기)
 * - 번들 최적화 (패키지 임포트 최적화)
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* TMDB 이미지 CDN 도메인을 Next.js Image 컴포넌트에서 사용하도록 허용 */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      /* YouTube 썸네일 (비디오 플레이어) */
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      /* Google OAuth 프로필 이미지 */
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      /* Kakao OAuth 프로필 이미지 */
      {
        protocol: "https",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "http",
        hostname: "k.kakaocdn.net",
      },
    ],

    /* 최신 이미지 포맷 우선 사용 (AVIF > WebP) — 최대 50% 용량 절감 */
    formats: ["image/avif", "image/webp"],

    /* 반응형 디바이스 크기 최적화 (모바일 → 데스크톱) */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],

    /* srcSet에 사용할 이미지 크기 (아이콘·썸네일용) */
    imageSizes: [16, 32, 48, 64, 96, 128, 256],

    /* 동시에 로드할 최소 캐시 TTL (초) — 이미지 CDN 캐시 1시간 */
    minimumCacheTTL: 3600,
  },

  /* 번들 최적화: 트리 셰이킹을 위한 패키지별 임포트 최적화 */
  experimental: {
    optimizePackageImports: ["framer-motion", "zustand"],
  },

  /* React 컴파일러 최적화 */
  reactCompiler: true,
};

export default nextConfig;
