/**
 * TV 시리즈 목록 페이지
 *
 * TMDB discover/tv API를 사용하여 TV 시리즈 목록을 표시합니다.
 * 드라마/예능 탭으로 구분하여 콘텐츠를 필터링합니다.
 *
 * 탭 구분:
 * - 전체: 모든 TV 시리즈
 * - 드라마: 장르 18(Drama) 포함
 * - 예능: 장르 10764(Reality), 10767(Talk) 포함
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import TVContent from "./TVContent";

// SEO 메타데이터
export const metadata: Metadata = {
  title: "TV 시리즈 | CinePickr",
  description:
    "인기 TV 시리즈, 드라마, 예능을 다양한 필터로 탐색해보세요.",
  openGraph: {
    title: "TV 시리즈 | CinePickr",
    description:
      "인기 TV 시리즈, 드라마, 예능을 다양한 필터로 탐색해보세요.",
  },
};

export default function TVShowsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* 페이지 제목 */}
      <h1 className="mb-6 text-3xl font-bold text-foreground">📺 TV 시리즈</h1>

      {/* Suspense로 감싸서 useSearchParams 사용 가능하게 함 */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <TVContent />
      </Suspense>
    </section>
  );
}
