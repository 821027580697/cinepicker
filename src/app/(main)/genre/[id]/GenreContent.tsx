/**
 * 장르별 콘텐츠 (클라이언트 컴포넌트)
 *
 * 특정 장르에 해당하는 콘텐츠를 영화/TV 탭으로 구분하여 표시합니다.
 * 장르 ID가 고정된 상태에서 추가 필터링을 지원합니다.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar from "@/components/content/FilterBar";
import ContentGrid from "@/components/content/ContentGrid";
import { cn } from "@/utils";

// ==============================
// 탭 정의
// ==============================

/** 콘텐츠 타입 탭 */
const TYPE_TABS = [
  { id: "movie" as const, label: "영화" },
  { id: "tv" as const, label: "TV 시리즈" },
] as const;

// ==============================
// 컴포넌트 Props
// ==============================

interface GenreContentProps {
  /** 장르 ID */
  genreId: number;
  /** 장르 이름 */
  genreName: string;
}

// ==============================
// 메인 컴포넌트
// ==============================

export default function GenreContent({
  genreId,
  genreName,
}: GenreContentProps) {
  const searchParams = useSearchParams();

  // 영화/TV 탭 상태
  const [activeType, setActiveType] = useState<"movie" | "tv">("movie");

  // 필터 상태
  const [filterParams, setFilterParams] = useState<Record<string, string>>(
    () => {
      const params: Record<string, string> = {};
      const year = searchParams.get("year");
      if (year) params.year = year;
      const sortBy = searchParams.get("sort_by");
      if (sortBy) params.sort_by = sortBy;
      const rating = searchParams.get("vote_average_gte");
      if (rating) params.vote_average_gte = rating;
      return params;
    }
  );

  // 장르 ID를 포함한 최종 쿼리 파라미터
  const queryParams = useMemo(() => {
    const params = { ...filterParams };
    // 고정 장르 ID를 with_genres에 포함
    const existingGenres = params.with_genres || "";
    if (existingGenres) {
      const allGenres = new Set([
        String(genreId),
        ...existingGenres.split(","),
      ]);
      params.with_genres = Array.from(allGenres).join(",");
    } else {
      params.with_genres = String(genreId);
    }
    return params;
  }, [filterParams, genreId]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (filters: Record<string, string>) => {
      setFilterParams(filters);
    },
    []
  );

  // 탭 변경 핸들러
  const handleTypeChange = (type: "movie" | "tv") => {
    setActiveType(type);
    setFilterParams({});
  };

  // API URL 결정
  const fetchUrl =
    activeType === "movie" ? "/api/discover/movies" : "/api/discover/tv";

  return (
    <>
      {/* ── 영화/TV 탭 ── */}
      <div className="mb-6 flex gap-1 rounded-lg bg-surface p-1">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTypeChange(tab.id)}
            className={cn(
              "flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all",
              activeType === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 필터바 (장르 고정) */}
      <FilterBar
        type={activeType}
        onFilterChange={handleFilterChange}
        fixedGenreId={genreId}
      />

      {/* 콘텐츠 그리드 (무한 스크롤) */}
      <ContentGrid
        type={activeType}
        fetchUrl={fetchUrl}
        queryParams={queryParams}
      />
    </>
  );
}
