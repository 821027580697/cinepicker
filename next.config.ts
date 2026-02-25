/**
 * Next.js 설정 파일
 *
 * - TMDB 이미지 CDN 도메인 허용 (Next.js Image 컴포넌트)
 * - 기타 프로젝트 설정
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
    ],
  },
};

export default nextConfig;
