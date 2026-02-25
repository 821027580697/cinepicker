/**
 * 사이트맵 자동 생성
 *
 * 검색 엔진 크롤러를 위한 sitemap.xml을 자동 생성합니다.
 *
 * 포함 URL:
 * - 정적 페이지 (메인, 영화, TV, 트렌딩 등)
 * - 인기 영화/TV 콘텐츠 상세 페이지 (TMDB API 기반)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from "next";
import { getPopularMovies, getPopularTVShows } from "@/lib/tmdb";

/** 사이트 기본 URL */
const SITE_URL = process.env.NEXTAUTH_URL || "https://cinepickr.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ──────────────────────────────
  // 정적 페이지
  // ──────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tv`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // ──────────────────────────────
  // 동적 페이지: 인기 콘텐츠
  // ──────────────────────────────
  let moviePages: MetadataRoute.Sitemap = [];
  let tvPages: MetadataRoute.Sitemap = [];

  try {
    // 인기 영화 상위 20개
    const movies = await getPopularMovies(1);
    moviePages = movies.results.slice(0, 20).map((movie) => ({
      url: `${SITE_URL}/movies/${movie.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // TMDB API 실패 시 건너뛰기
    console.error("사이트맵: 인기 영화 조회 실패");
  }

  try {
    // 인기 TV 시리즈 상위 20개
    const tvShows = await getPopularTVShows(1);
    tvPages = tvShows.results.slice(0, 20).map((show) => ({
      url: `${SITE_URL}/tv/${show.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    console.error("사이트맵: 인기 TV 시리즈 조회 실패");
  }

  return [...staticPages, ...moviePages, ...tvPages];
}
