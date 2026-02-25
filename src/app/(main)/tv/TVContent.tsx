/**
 * TV 시리즈 목록 콘텐츠 (클라이언트 컴포넌트)
 *
 * 드라마/예능 탭 구분과 FilterBar + ContentGrid를 조합합니다.
 *
 * 탭별 장르 필터:
 * - 전체: 필터 없음
 * - 드라마: 장르 ID 18 (Drama)
 * - 예능: 장르 ID 10764 (Reality), 10767 (Talk)
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

/** TV 카테고리 탭 */
const TV_TABS = [
  { id: "all", label: "전체", genreFilter: "" },
  { id: "drama", label: "드라마", genreFilter: "18" },
  { id: "variety", label: "예능", genreFilter: "10764,10767" },
] as const;

type TVTabId = (typeof TV_TABS)[number]["id"];

// ==============================
// 메인 컴포넌트
// ==============================

export default function TVContent() {
  const searchParams = useSearchParams();

  // URL의 genre 파라미터로 초기 탭 결정
  const initialTab = (): TVTabId => {
    const genre = searchParams.get("genre");
    if (genre === "drama") return "drama";
    if (genre === "variety") return "variety";
    return "all";
  };

  const [activeTab, setActiveTab] = useState<TVTabId>(initialTab);

  // URL 쿼리 파라미터에서 초기 필터 값 읽기
  const [filterParams, setFilterParams] = useState<Record<string, string>>(
    () => {
      const params: Record<string, string> = {};
      const genres = searchParams.get("genres");
      if (genres) params.with_genres = genres;
      const year = searchParams.get("year");
      if (year) params.year = year;
      const sortBy = searchParams.get("sort_by");
      if (sortBy) params.sort_by = sortBy;
      const rating = searchParams.get("vote_average_gte");
      if (rating) params.vote_average_gte = rating;
      return params;
    }
  );

  // 현재 탭의 장르 필터를 쿼리 파라미터에 합침
  const currentQueryParams = useMemo(() => {
    const tab = TV_TABS.find((t) => t.id === activeTab);
    const params = { ...filterParams };

    if (tab && tab.genreFilter) {
      // 탭 장르 + 사용자 선택 장르 합산
      const userGenres = params.with_genres || "";
      const tabGenres = tab.genreFilter;

      if (userGenres) {
        // 중복 제거
        const allGenres = new Set([
          ...tabGenres.split(","),
          ...userGenres.split(","),
        ]);
        params.with_genres = Array.from(allGenres).join(",");
      } else {
        params.with_genres = tabGenres;
      }
    }

    return params;
  }, [activeTab, filterParams]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (filters: Record<string, string>) => {
      setFilterParams(filters);
    },
    []
  );

  // 탭 변경 핸들러
  const handleTabChange = (tabId: TVTabId) => {
    setActiveTab(tabId);
    // 탭 변경 시 필터 초기화
    setFilterParams({});
  };

  return (
    <>
      {/* ── 드라마/예능 탭 ── */}
      <div className="mb-6 flex gap-1 rounded-lg bg-surface p-1">
        {TV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all",
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 필터바 */}
      <FilterBar type="tv" onFilterChange={handleFilterChange} />

      {/* 콘텐츠 그리드 (무한 스크롤) */}
      <ContentGrid
        type="tv"
        fetchUrl="/api/discover/tv"
        queryParams={currentQueryParams}
      />
    </>
  );
}
