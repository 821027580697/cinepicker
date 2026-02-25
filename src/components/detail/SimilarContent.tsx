/**
 * 비슷한 콘텐츠 섹션 컴포넌트
 *
 * 현재 콘텐츠와 유사한 영화/TV 시리즈를 Carousel 컴포넌트를 재사용하여 표시합니다.
 *
 * 기능:
 * - 기존 Carousel 컴포넌트 재사용
 * - 영화/TV 타입에 맞는 링크 생성
 * - 유사 콘텐츠가 없으면 렌더링하지 않음
 */

import Carousel from "@/components/content/Carousel";
import type { Movie, TVShow } from "@/types/tmdb";

// ==============================
// 컴포넌트 Props
// ==============================

interface SimilarContentProps {
  /** 유사 콘텐츠 배열 */
  items: (Movie | TVShow)[];
  /** 콘텐츠 타입 (movie 또는 tv) */
  type: "movie" | "tv";
}

export default function SimilarContent({ items, type }: SimilarContentProps) {
  // 유사 콘텐츠가 없으면 렌더링하지 않음
  if (!items || items.length === 0) return null;

  return (
    <Carousel
      title="🎞️ 비슷한 콘텐츠"
      items={items}
      type={type}
      animate
    />
  );
}
