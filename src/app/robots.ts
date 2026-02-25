/**
 * robots.txt 설정
 *
 * 검색 엔진 크롤러의 접근 권한을 설정합니다.
 *
 * 허용:
 * - 모든 공개 페이지 (/, /movies, /tv, /trending, /search)
 *
 * 차단:
 * - API 라우트 (/api/)
 * - 인증 관련 페이지 (/login, /register)
 * - 프로필 페이지 (/profile)
 * - 관심 목록 (/watchlist)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from "next";

/** 사이트 기본 URL */
const SITE_URL = process.env.NEXTAUTH_URL || "https://cinepickr.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/movies", "/tv", "/trending", "/search"],
        disallow: ["/api/", "/login", "/register", "/profile", "/watchlist"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
