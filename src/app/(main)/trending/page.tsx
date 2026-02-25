/**
 * 트렌딩 콘텐츠 페이지
 *
 * TMDB trending API를 사용하여 현재 인기 있는 콘텐츠를 표시합니다.
 *
 * 기능:
 * - 일간/주간 트렌딩 탭
 * - 영화/TV 탭
 * - 순위 번호 오버레이 표시
 * - 무한 스크롤 그리드
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import TrendingContent from "./TrendingContent";

// SEO 메타데이터
export const metadata: Metadata = {
  title: "트렌딩 | CinePickr",
  description: "지금 가장 인기 있는 영화와 TV 시리즈를 확인해보세요.",
  openGraph: {
    title: "트렌딩 | CinePickr",
    description: "지금 가장 인기 있는 영화와 TV 시리즈를 확인해보세요.",
  },
};

export default function TrendingPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* 페이지 제목 */}
      <h1 className="mb-6 text-3xl font-bold text-foreground">🔥 트렌딩</h1>

      {/* Suspense로 클라이언트 컴포넌트 래핑 */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <TrendingContent />
      </Suspense>
    </section>
  );
}
