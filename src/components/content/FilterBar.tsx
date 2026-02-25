/**
 * 필터바 컴포넌트
 *
 * 콘텐츠 목록 페이지에서 장르, 연도, 정렬, 평점 필터를 제공합니다.
 * 필터 변경 시 URL 쿼리 파라미터를 업데이트하여 새로고침/공유 시에도 상태를 유지합니다.
 *
 * 기능:
 * - 장르 필터: 다중 선택 드롭다운
 * - 연도 필터: 셀렉트 박스 (1990 ~ 현재 연도)
 * - 정렬: 인기순, 평점순, 최신순
 * - 평점 최소: 범위 슬라이더 (0 ~ 10)
 * - 필터 초기화 버튼
 * - 모바일: 접기/펼치기
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils";

// ==============================
// 장르 데이터 (TMDB 기준)
// ==============================

/** 영화 장르 목록 */
export const MOVIE_GENRES = [
  { id: 28, name: "액션" },
  { id: 12, name: "모험" },
  { id: 16, name: "애니메이션" },
  { id: 35, name: "코미디" },
  { id: 80, name: "범죄" },
  { id: 99, name: "다큐멘터리" },
  { id: 18, name: "드라마" },
  { id: 10751, name: "가족" },
  { id: 14, name: "판타지" },
  { id: 36, name: "역사" },
  { id: 27, name: "공포" },
  { id: 10402, name: "음악" },
  { id: 9648, name: "미스터리" },
  { id: 10749, name: "로맨스" },
  { id: 878, name: "SF" },
  { id: 53, name: "스릴러" },
  { id: 10752, name: "전쟁" },
  { id: 37, name: "서부" },
] as const;

/** TV 장르 목록 */
export const TV_GENRES = [
  { id: 10759, name: "액션/모험" },
  { id: 16, name: "애니메이션" },
  { id: 35, name: "코미디" },
  { id: 80, name: "범죄" },
  { id: 99, name: "다큐멘터리" },
  { id: 18, name: "드라마" },
  { id: 10751, name: "가족" },
  { id: 10762, name: "키즈" },
  { id: 9648, name: "미스터리" },
  { id: 10764, name: "리얼리티" },
  { id: 10765, name: "SF/판타지" },
  { id: 10766, name: "연속극" },
  { id: 10767, name: "토크쇼" },
  { id: 10768, name: "전쟁/정치" },
] as const;

/** 정렬 옵션 */
const SORT_OPTIONS = [
  { label: "인기순", value: "popularity.desc" },
  { label: "평점순", value: "vote_average.desc" },
  { label: "최신순", value: "release_date.desc" },
] as const;

/** TV 정렬 옵션 (release_date 대신 first_air_date) */
const TV_SORT_OPTIONS = [
  { label: "인기순", value: "popularity.desc" },
  { label: "평점순", value: "vote_average.desc" },
  { label: "최신순", value: "first_air_date.desc" },
] as const;

// ==============================
// 컴포넌트 Props
// ==============================

interface FilterBarProps {
  /** 콘텐츠 타입 (영화 또는 TV) */
  type: "movie" | "tv";
  /** 필터 변경 콜백 (쿼리 파라미터 객체) */
  onFilterChange: (filters: Record<string, string>) => void;
  /** 특정 장르 고정 (장르별 페이지에서 사용) */
  fixedGenreId?: number;
  /** 장르 목록 오버라이드 */
  genres?: readonly { id: number; name: string }[];
}

// ==============================
// 연도 범위 생성
// ==============================

/** 1990부터 현재 연도까지 연도 목록 생성 */
function generateYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 1990; y--) {
    years.push(y);
  }
  return years;
}

const YEAR_OPTIONS = generateYearOptions();

// ==============================
// 메인 컴포넌트
// ==============================

export default function FilterBar({
  type,
  onFilterChange,
  fixedGenreId,
  genres,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 장르 목록 결정
  const genreList = genres || (type === "movie" ? MOVIE_GENRES : TV_GENRES);
  const sortOptions = type === "movie" ? SORT_OPTIONS : TV_SORT_OPTIONS;

  // ── URL 쿼리 파라미터에서 초기값 읽기 ──
  const [selectedGenres, setSelectedGenres] = useState<number[]>(() => {
    if (fixedGenreId) return [fixedGenreId];
    const genresParam = searchParams.get("genres");
    return genresParam ? genresParam.split(",").map(Number).filter(Boolean) : [];
  });
  const [selectedYear, setSelectedYear] = useState<string>(
    () => searchParams.get("year") || ""
  );
  const [sortBy, setSortBy] = useState<string>(
    () => searchParams.get("sort_by") || "popularity.desc"
  );
  const [minRating, setMinRating] = useState<number>(() => {
    const rating = searchParams.get("vote_average_gte");
    return rating ? Number(rating) : 0;
  });

  // 모바일 필터 접기/펼치기
  const [isExpanded, setIsExpanded] = useState(false);

  // 장르 드롭다운 열림 상태
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  // ── 장르 드롭다운 외부 클릭 감지 ──
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── 필터 변경 시 URL 쿼리 파라미터 업데이트 + 콜백 호출 ──
  const applyFilters = useCallback(
    (
      newGenres: number[],
      newYear: string,
      newSort: string,
      newRating: number
    ) => {
      // URL 쿼리 파라미터 구성
      const params = new URLSearchParams();
      if (newGenres.length > 0 && !fixedGenreId) {
        params.set("genres", newGenres.join(","));
      }
      if (newYear) params.set("year", newYear);
      if (newSort !== "popularity.desc") params.set("sort_by", newSort);
      if (newRating > 0) params.set("vote_average_gte", String(newRating));

      // URL 업데이트 (히스토리에 추가하지 않고 교체)
      const queryString = params.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });

      // 부모 컴포넌트에 필터 전달
      const filterParams: Record<string, string> = {};
      const effectiveGenres = fixedGenreId
        ? [fixedGenreId, ...newGenres.filter((g) => g !== fixedGenreId)]
        : newGenres;
      if (effectiveGenres.length > 0) {
        filterParams.with_genres = effectiveGenres.join(",");
      }
      if (newYear) filterParams.year = newYear;
      filterParams.sort_by = newSort;
      if (newRating > 0) {
        filterParams.vote_average_gte = String(newRating);
      }

      onFilterChange(filterParams);
    },
    [router, onFilterChange, fixedGenreId]
  );

  // ── 장르 토글 ──
  const toggleGenre = (genreId: number) => {
    // 고정 장르는 해제 불가
    if (genreId === fixedGenreId) return;

    const newGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter((id) => id !== genreId)
      : [...selectedGenres, genreId];

    setSelectedGenres(newGenres);
    applyFilters(newGenres, selectedYear, sortBy, minRating);
  };

  // ── 연도 변경 ──
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    applyFilters(selectedGenres, year, sortBy, minRating);
  };

  // ── 정렬 변경 ──
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    applyFilters(selectedGenres, selectedYear, sort, minRating);
  };

  // ── 평점 변경 ──
  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
    applyFilters(selectedGenres, selectedYear, sortBy, rating);
  };

  // ── 필터 초기화 ──
  const resetFilters = () => {
    const defaultGenres = fixedGenreId ? [fixedGenreId] : [];
    setSelectedGenres(defaultGenres);
    setSelectedYear("");
    setSortBy("popularity.desc");
    setMinRating(0);
    applyFilters(defaultGenres, "", "popularity.desc", 0);
  };

  // ── 활성 필터 개수 계산 ──
  const activeFilterCount =
    (selectedGenres.length > (fixedGenreId ? 1 : 0) ? 1 : 0) +
    (selectedYear ? 1 : 0) +
    (sortBy !== "popularity.desc" ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  // ── 선택된 장르 이름 표시 ──
  const selectedGenreNames = selectedGenres
    .filter((id) => id !== fixedGenreId)
    .map((id) => genreList.find((g) => g.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="mb-6 rounded-xl bg-card p-4 shadow-sm">
      {/* ── 모바일 토글 버튼 ── */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between md:hidden"
      >
        <div className="flex items-center gap-2">
          {/* 필터 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5 text-foreground"
          >
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          <span className="font-semibold text-foreground">필터</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {/* 화살표 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── 필터 컨텐츠 ── */}
      <div
        className={cn(
          "mt-4 space-y-4 md:mt-0 md:block",
          /* 모바일에서 접기/펼치기 */
          !isExpanded && "hidden md:block"
        )}
      >
        {/* 1행: 장르 + 연도 + 정렬 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {/* ── 장르 다중 선택 드롭다운 ── */}
          {!fixedGenreId && (
            <div className="relative" ref={genreDropdownRef}>
              <button
                onClick={() => setIsGenreOpen(!isGenreOpen)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  "border-border bg-surface text-foreground hover:bg-surface-hover",
                  isGenreOpen && "ring-2 ring-primary"
                )}
              >
                <span>
                  {selectedGenreNames.length > 0
                    ? `장르 (${selectedGenreNames.length})`
                    : "장르 선택"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isGenreOpen && "rotate-180"
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* 장르 드롭다운 패널 */}
              {isGenreOpen && (
                <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-lg border border-border bg-card p-3 shadow-xl">
                  <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto">
                    {genreList.map((genre) => (
                      <button
                        key={genre.id}
                        onClick={() => toggleGenre(genre.id)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                          selectedGenres.includes(genre.id)
                            ? "bg-primary text-white"
                            : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        )}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 연도 셀렉트 박스 ── */}
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">전체 연도</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={String(year)}>
                {year}년
              </option>
            ))}
          </select>

          {/* ── 정렬 셀렉트 박스 ── */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2행: 평점 슬라이더 + 초기화 버튼 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* ── 평점 범위 슬라이더 ── */}
          <div className="flex items-center gap-3">
            <label className="whitespace-nowrap text-sm font-medium text-muted-foreground">
              최소 평점
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minRating}
              onChange={(e) => handleRatingChange(Number(e.target.value))}
              className="h-2 w-40 cursor-pointer appearance-none rounded-lg bg-surface accent-primary sm:w-52"
            />
            <span className="min-w-[3rem] text-sm font-semibold text-foreground">
              {minRating > 0 ? `${minRating}+` : "전체"}
            </span>
          </div>

          {/* ── 필터 초기화 버튼 ── */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 self-end rounded-lg px-3 py-1.5 text-sm font-medium text-primary-light transition-colors hover:bg-surface sm:self-auto"
            >
              {/* X 아이콘 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              필터 초기화
            </button>
          )}
        </div>

        {/* ── 선택된 장르 태그 표시 ── */}
        {selectedGenreNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedGenres
              .filter((id) => id !== fixedGenreId)
              .map((genreId) => {
                const genre = genreList.find((g) => g.id === genreId);
                if (!genre) return null;
                return (
                  <span
                    key={genreId}
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light"
                  >
                    {genre.name}
                    <button
                      onClick={() => toggleGenre(genreId)}
                      className="ml-1 hover:text-primary"
                      aria-label={`${genre.name} 장르 제거`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
