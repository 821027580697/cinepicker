/**
 * 장르별 콘텐츠 페이지
 *
 * 특정 장르에 해당하는 영화/TV 시리즈 목록을 표시합니다.
 * 동적 라우트: /genre/[id] (예: /genre/28 → 액션 장르)
 *
 * 기능:
 * - 장르 ID 기반 동적 라우트
 * - 장르명 동적 표시 및 SEO 메타데이터
 * - 영화/TV 탭 전환
 * - FilterBar + ContentGrid 패턴 재사용
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import GenreContent from "./GenreContent";

// ==============================
// 장르 ID → 장르명 매핑 (서버 사이드)
// ==============================

/** 통합 장르 맵 (영화 + TV) */
const ALL_GENRES: Record<number, string> = {
  /* 영화 장르 */
  28: "액션",
  12: "모험",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  99: "다큐멘터리",
  18: "드라마",
  10751: "가족",
  14: "판타지",
  36: "역사",
  27: "공포",
  10402: "음악",
  9648: "미스터리",
  10749: "로맨스",
  878: "SF",
  10770: "TV 영화",
  53: "스릴러",
  10752: "전쟁",
  37: "서부",
  /* TV 장르 */
  10759: "액션/모험",
  10762: "키즈",
  10763: "뉴스",
  10764: "리얼리티",
  10765: "SF/판타지",
  10766: "연속극",
  10767: "토크쇼",
  10768: "전쟁/정치",
};

// ==============================
// 동적 메타데이터
// ==============================

interface GenrePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GenrePageProps): Promise<Metadata> {
  const { id } = await params;
  const genreId = parseInt(id);
  const genreName = ALL_GENRES[genreId] || `장르 #${id}`;

  return {
    title: `${genreName} | CinePickr`,
    description: `${genreName} 장르의 인기 영화와 TV 시리즈를 탐색해보세요.`,
    openGraph: {
      title: `${genreName} | CinePickr`,
      description: `${genreName} 장르의 인기 영화와 TV 시리즈를 탐색해보세요.`,
    },
  };
}

// ==============================
// 페이지 컴포넌트
// ==============================

export default async function GenrePage({ params }: GenrePageProps) {
  const { id } = await params;
  const genreId = parseInt(id);
  const genreName = ALL_GENRES[genreId] || `장르 #${id}`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* 페이지 제목 */}
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        🎭 {genreName}
      </h1>

      {/* Suspense로 클라이언트 컴포넌트 래핑 */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <GenreContent genreId={genreId} genreName={genreName} />
      </Suspense>
    </section>
  );
}
