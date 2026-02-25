/**
 * 트렌딩 콘텐츠 (클라이언트 컴포넌트)
 *
 * 일간/주간 트렌딩과 영화/TV 탭을 조합하여 트렌딩 콘텐츠를 표시합니다.
 * 무한 스크롤과 순위 번호 오버레이를 포함합니다.
 *
 * 탭 구성:
 * - 시간 범위: 일간(day) / 주간(week)
 * - 미디어 타입: 영화(movie) / TV(tv)
 */

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn, getYear, truncateText } from "@/utils";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import ContentCard from "@/components/content/ContentCard";
import { CardGridSkeleton } from "@/components/common/Skeleton";
import type { TrendingItem } from "@/types/tmdb";

// ==============================
// 탭 정의
// ==============================

/** 시간 범위 탭 */
const TIME_TABS = [
  { id: "day" as const, label: "오늘" },
  { id: "week" as const, label: "이번 주" },
] as const;

/** 미디어 타입 탭 */
const MEDIA_TABS = [
  { id: "movie" as const, label: "영화" },
  { id: "tv" as const, label: "TV" },
] as const;

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

export default function TrendingContent() {
  // 탭 상태 관리
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("day");
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

  // 쿼리 파라미터 구성
  const queryParams = useMemo(
    () => ({
      media_type: mediaType,
      time_window: timeWindow,
    }),
    [mediaType, timeWindow]
  );

  // 무한 스크롤 훅 사용
  const {
    data,
    isLoading,
    isInitialLoading,
    hasMore,
    error,
    totalResults,
    observerRef,
  } = useInfiniteScroll<TrendingItem>({
    fetchUrl: "/api/trending",
    queryParams,
  });

  // ── 시간 범위 탭 변경 ──
  const handleTimeChange = (time: "day" | "week") => {
    setTimeWindow(time);
  };

  // ── 미디어 타입 탭 변경 ──
  const handleMediaChange = (media: "movie" | "tv") => {
    setMediaType(media);
  };

  return (
    <>
      {/* ── 탭 영역 ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* 시간 범위 탭 (일간/주간) */}
        <div className="flex gap-1 rounded-lg bg-surface p-1">
          {TIME_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTimeChange(tab.id)}
              className={cn(
                "rounded-md px-6 py-2 text-sm font-semibold transition-all",
                timeWindow === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 미디어 타입 탭 (영화/TV) */}
        <div className="flex gap-1 rounded-lg bg-surface p-1">
          {MEDIA_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleMediaChange(tab.id)}
              className={cn(
                "rounded-md px-6 py-2 text-sm font-semibold transition-all",
                mediaType === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 초기 로딩 스켈레톤 ── */}
      {isInitialLoading && <CardGridSkeleton count={20} />}

      {/* ── 에러 상태 ── */}
      {error && (
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
      )}

      {/* ── 결과 없음 ── */}
      {!isInitialLoading && !error && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-foreground">
            트렌딩 콘텐츠가 없습니다
          </p>
        </div>
      )}

      {/* ── 콘텐츠 그리드 ── */}
      {data.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            총{" "}
            <span className="font-semibold text-foreground">
              {totalResults.toLocaleString()}
            </span>
            개의 결과
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {data.map((item, index) => {
              // TrendingItem에서 제목과 날짜 추출
              const title =
                item.media_type === "movie"
                  ? item.title || ""
                  : item.name || "";
              const releaseDate =
                item.media_type === "movie"
                  ? item.release_date || ""
                  : item.first_air_date || "";

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
                    type={item.media_type === "movie" ? "movie" : "tv"}
                    title={title}
                    posterPath={item.poster_path}
                    voteAverage={item.vote_average}
                    genreIds={item.genre_ids}
                    releaseDate={releaseDate}
                    overview={item.overview}
                    rank={index + 1}
                  />
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* ── 무한 스크롤 감지 영역 ── */}
      <div ref={observerRef} className="h-4" />

      {/* ── 로딩 스피너 ── */}
      {isLoading && hasMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
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
    </>
  );
}
