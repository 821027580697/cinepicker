/**
 * 콘텐츠 그리드 컴포넌트
 *
 * 영화/TV 콘텐츠를 반응형 그리드 레이아웃으로 표시합니다.
 * useInfiniteScroll 훅을 사용하여 무한 스크롤을 지원합니다.
 *
 * 기능:
 * - 그리드 레이아웃: 5열(xl) / 4열(lg) / 3열(md) / 2열(sm)
 * - ContentCard 컴포넌트 재사용
 * - 무한 스크롤 (Intersection Observer)
 * - 로딩 시 하단 스피너
 * - 더 이상 데이터 없을 시 안내 메시지
 * - 결과 없을 시 빈 상태 표시
 */

"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import ContentCard from "./ContentCard";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { CardGridSkeleton } from "@/components/common/Skeleton";
import type { Movie, TVShow } from "@/types/tmdb";

// ==============================
// 컴포넌트 Props
// ==============================

interface ContentGridProps {
  /** 콘텐츠 타입 (영화 또는 TV) */
  type: "movie" | "tv";
  /** API 엔드포인트 URL (예: "/api/discover/movies") */
  fetchUrl: string;
  /** 필터 쿼리 파라미터 */
  queryParams?: Record<string, string>;
  /** 순위 번호 표시 여부 */
  showRank?: boolean;
}

/** Movie 타입 가드 */
function isMovie(item: Movie | TVShow): item is Movie {
  return "title" in item;
}

// ==============================
// 애니메이션 설정
// ==============================

/** 카드 등장 애니메이션 */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.05, 0.3),
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

// ==============================
// 메인 컴포넌트
// ==============================

export default function ContentGrid({
  type,
  fetchUrl,
  queryParams = {},
  showRank = false,
}: ContentGridProps) {
  // 무한 스크롤 훅 사용
  const {
    data,
    isLoading,
    isInitialLoading,
    hasMore,
    error,
    totalResults,
    observerRef,
  } = useInfiniteScroll<Movie | TVShow>({
    fetchUrl,
    queryParams,
  });

  // ── 초기 로딩 스켈레톤 ──
  if (isInitialLoading) {
    return (
      <div>
        <CardGridSkeleton count={20} />
      </div>
    );
  }

  // ── 에러 상태 ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="mb-4 h-16 w-16 text-muted-foreground"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-lg font-semibold text-foreground">
          오류가 발생했습니다
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  // ── 결과 없음 ──
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="mb-4 h-16 w-16 text-muted-foreground"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-lg font-semibold text-foreground">
          검색 결과가 없습니다
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          다른 필터 조건으로 다시 검색해보세요.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── 전체 결과 수 ── */}
      <p className="mb-4 text-sm text-muted-foreground">
        총 <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span>개의 결과
      </p>

      {/* ── 그리드 레이아웃 ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {data.map((item, index) => {
          const movie = isMovie(item);
          return (
            <motion.div
              key={`${item.id}-${index}`}
              custom={index % 20}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <ContentCard
                id={item.id}
                type={type}
                title={movie ? item.title : item.name}
                posterPath={item.poster_path}
                voteAverage={item.vote_average}
                genreIds={item.genre_ids}
                releaseDate={movie ? item.release_date : item.first_air_date}
                overview={item.overview}
                rank={showRank ? index + 1 : undefined}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ── 무한 스크롤 감지 영역 ── */}
      <div ref={observerRef} className="h-4" />

      {/* ── 로딩 스피너 ── */}
      {isLoading && hasMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            {/* 회전 스피너 */}
            <svg
              className="h-6 w-6 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-muted-foreground">
              콘텐츠를 불러오는 중...
            </span>
          </div>
        </div>
      )}

      {/* ── 모든 데이터 로드 완료 메시지 ── */}
      {!hasMore && data.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            ✨ 모든 콘텐츠를 불러왔습니다
          </p>
        </div>
      )}
    </div>
  );
}
