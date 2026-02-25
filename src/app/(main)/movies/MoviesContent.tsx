/**
 * 영화 목록 콘텐츠 (클라이언트 컴포넌트)
 *
 * FilterBar와 ContentGrid를 조합하여 영화 목록 페이지의
 * 인터랙티브한 부분을 담당합니다.
 * useSearchParams를 사용하므로 Suspense 경계 내에 있어야 합니다.
 */

"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar from "@/components/content/FilterBar";
import ContentGrid from "@/components/content/ContentGrid";

export default function MoviesContent() {
  const searchParams = useSearchParams();

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

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (filters: Record<string, string>) => {
      setFilterParams(filters);
    },
    []
  );

  return (
    <>
      {/* 필터바 */}
      <FilterBar type="movie" onFilterChange={handleFilterChange} />

      {/* 콘텐츠 그리드 (무한 스크롤) */}
      <ContentGrid
        type="movie"
        fetchUrl="/api/discover/movies"
        queryParams={filterParams}
      />
    </>
  );
}
