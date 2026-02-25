/**
 * 영화 목록 페이지
 *
 * TMDB discover/movie API를 사용하여 영화 목록을 표시합니다.
 * FilterBar로 장르, 연도, 정렬, 평점 필터를 제공하고,
 * ContentGrid로 무한 스크롤 그리드를 구성합니다.
 * URL 쿼리 파라미터로 필터 상태를 관리합니다.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import MoviesContent from "./MoviesContent";

// SEO 메타데이터
export const metadata: Metadata = {
  title: "영화 | CinePickr",
  description:
    "인기 영화, 현재 상영작, 평점 높은 영화를 다양한 필터로 탐색해보세요.",
  openGraph: {
    title: "영화 | CinePickr",
    description:
      "인기 영화, 현재 상영작, 평점 높은 영화를 다양한 필터로 탐색해보세요.",
  },
};

export default function MoviesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* 페이지 제목 */}
      <h1 className="mb-6 text-3xl font-bold text-foreground">🎬 영화</h1>

      {/* Suspense로 감싸서 useSearchParams 사용 가능하게 함 */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <MoviesContent />
      </Suspense>
    </section>
  );
}
