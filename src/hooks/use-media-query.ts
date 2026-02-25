/**
 * 반응형 미디어 쿼리 커스텀 훅
 *
 * 브라우저 창 크기 변화를 감지하여 반응형 UI를 구현할 때 사용합니다.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 640px)");
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 */

"use client";

import { useState, useEffect } from "react";

/**
 * CSS 미디어 쿼리 매칭 상태를 반환하는 훅
 *
 * @param query - CSS 미디어 쿼리 문자열
 * @returns 미디어 쿼리 매칭 여부 (boolean)
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // 1단계: MediaQueryList 객체 생성
    const mediaQuery = window.matchMedia(query);

    // 2단계: 초기값 설정
    setMatches(mediaQuery.matches);

    // 3단계: 변화 감지 리스너 등록
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);

    // 4단계: 클린업 (리스너 해제)
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
