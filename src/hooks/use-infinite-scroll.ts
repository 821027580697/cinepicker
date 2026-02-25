/**
 * 무한 스크롤 커스텀 훅
 *
 * Intersection Observer API를 사용하여 스크롤이 하단에 도달했을 때
 * 자동으로 다음 페이지 데이터를 로드합니다.
 *
 * @example
 * const { data, isLoading, hasMore, observerRef } = useInfiniteScroll({
 *   fetchUrl: "/api/discover/movies",
 *   queryParams: { sort_by: "popularity.desc" },
 * });
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ==============================
// 타입 정의
// ==============================

/** TMDB 페이지네이션 응답 형태 */
interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** useInfiniteScroll 훅 옵션 */
interface UseInfiniteScrollOptions {
  /** API 호출 URL (예: "/api/discover/movies") */
  fetchUrl: string;
  /** 추가 쿼리 파라미터 (필터, 정렬 등) */
  queryParams?: Record<string, string>;
  /** 초기 데이터를 사용할지 여부 (기본값: true) */
  enabled?: boolean;
}

/** useInfiniteScroll 훅 반환 타입 */
interface UseInfiniteScrollReturn<T> {
  /** 누적된 전체 데이터 */
  data: T[];
  /** 현재 로딩 중 여부 */
  isLoading: boolean;
  /** 초기 로딩 중 여부 (첫 페이지) */
  isInitialLoading: boolean;
  /** 더 불러올 데이터가 있는지 여부 */
  hasMore: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 전체 결과 수 */
  totalResults: number;
  /** Intersection Observer가 관찰할 요소에 연결할 ref */
  observerRef: React.RefObject<HTMLDivElement | null>;
  /** 데이터 초기화 (필터 변경 시 사용) */
  reset: () => void;
}

// ==============================
// 훅 구현
// ==============================

/**
 * 무한 스크롤을 위한 커스텀 훅
 *
 * 1단계: 초기 데이터 로드
 * 2단계: Intersection Observer로 하단 감지
 * 3단계: 다음 페이지 자동 로드
 * 4단계: 필터 변경 시 데이터 초기화
 *
 * @param options - 무한 스크롤 설정 옵션
 * @returns 데이터, 로딩 상태, Observer ref 등
 */
export function useInfiniteScroll<T = Record<string, unknown>>(
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn<T> {
  const { fetchUrl, queryParams = {}, enabled = true } = options;

  // 상태 관리
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Intersection Observer 대상 요소 ref
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 중복 요청 방지를 위한 ref
  const isFetchingRef = useRef(false);

  // 쿼리 파라미터 문자열화 (의존성 배열에 사용)
  const queryString = JSON.stringify(queryParams);

  // ──────────────────────────────
  // 1단계: 데이터 fetch 함수
  // ──────────────────────────────
  const fetchData = useCallback(
    async (pageNum: number, isReset: boolean = false) => {
      // 중복 요청 방지
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        // URL 쿼리 파라미터 구성
        const params = new URLSearchParams({
          page: String(pageNum),
          ...JSON.parse(queryString),
        });

        const response = await fetch(`${fetchUrl}?${params.toString()}`);

        if (!response.ok) {
          throw new Error("데이터를 불러오는 중 오류가 발생했습니다.");
        }

        const result: PaginatedResponse<T> = await response.json();

        // 데이터 누적 또는 초기화
        setData((prev) =>
          isReset ? result.results : [...prev, ...result.results]
        );
        setTotalResults(result.total_results);
        setHasMore(pageNum < result.total_pages);
        setPage(pageNum);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.";
        setError(message);
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
        isFetchingRef.current = false;
      }
    },
    [fetchUrl, queryString]
  );

  // ──────────────────────────────
  // 2단계: 필터 변경 시 데이터 초기화 + 재로드
  // ──────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // 필터 변경 시 상태 초기화
    setData([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoading(true);

    fetchData(1, true);
  }, [fetchData, enabled]);

  // ──────────────────────────────
  // 3단계: Intersection Observer로 하단 감지
  // ──────────────────────────────
  useEffect(() => {
    const target = observerRef.current;
    if (!target || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // 요소가 뷰포트에 들어오고, 더 불러올 데이터가 있고, 로딩 중이 아닐 때
        if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
          fetchData(page + 1, false);
        }
      },
      {
        // 하단에서 200px 전에 미리 로드 시작
        rootMargin: "0px 0px 200px 0px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchData, hasMore, page, enabled]);

  // ──────────────────────────────
  // 4단계: 수동 초기화 함수
  // ──────────────────────────────
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoading(true);
    fetchData(1, true);
  }, [fetchData]);

  return {
    data,
    isLoading,
    isInitialLoading,
    hasMore,
    error,
    totalResults,
    observerRef,
    reset,
  };
}
