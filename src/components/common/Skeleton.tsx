/**
 * 로딩 스켈레톤 컴포넌트 모음
 *
 * 데이터 로딩 중 사용자에게 콘텐츠 구조를 미리 보여주는 플레이스홀더입니다.
 * Tailwind의 animate-pulse를 활용하여 자연스러운 로딩 효과를 구현합니다.
 *
 * 컴포넌트:
 * - CardSkeleton: 콘텐츠 카드 (포스터 + 제목 + 메타 정보)
 * - BannerSkeleton: 히어로 배너 섹션
 * - CardGridSkeleton: 카드 그리드 (여러 카드 스켈레톤)
 * - TextSkeleton: 텍스트 라인 플레이스홀더
 */

import { cn } from "@/utils";

// ==============================
// 기본 스켈레톤 블록
// ==============================

interface SkeletonBlockProps {
  className?: string;
}

/**
 * 기본 스켈레톤 블록
 *
 * animate-pulse가 적용된 회색 박스를 렌더링합니다.
 * 다른 스켈레톤 컴포넌트의 빌딩 블록으로 사용됩니다.
 */
export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-surface dark:bg-card",
        className
      )}
    />
  );
}

// ==============================
// 콘텐츠 카드 스켈레톤
// ==============================

/**
 * 콘텐츠 카드 스켈레톤
 *
 * 영화/드라마 포스터 카드의 로딩 상태를 표시합니다.
 * - 포스터 영역 (2:3 비율)
 * - 제목 텍스트 라인
 * - 부가 정보 텍스트 라인 (연도, 평점)
 */
export function CardSkeleton() {
  return (
    <div className="space-y-3">
      {/* 포스터 영역 (2:3 비율) */}
      <SkeletonBlock className="aspect-[2/3] w-full rounded-xl" />
      {/* 제목 라인 */}
      <SkeletonBlock className="h-4 w-3/4" />
      {/* 부가 정보 라인 (짧은 텍스트) */}
      <SkeletonBlock className="h-3 w-1/2" />
    </div>
  );
}

// ==============================
// 배너 스켈레톤
// ==============================

/**
 * 히어로 배너 스켈레톤
 *
 * 메인 페이지 상단 히어로 배너의 로딩 상태를 표시합니다.
 * - 전체 폭 배경 이미지 영역
 * - 좌하단 텍스트 영역 (제목, 설명, 버튼)
 */
export function BannerSkeleton() {
  return (
    <div className="relative w-full">
      {/* 배경 이미지 영역 */}
      <SkeletonBlock className="aspect-[21/9] w-full rounded-none sm:aspect-[2.5/1]" />

      {/* 오버레이 텍스트 영역 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
        {/* 제목 */}
        <SkeletonBlock className="mb-3 h-8 w-1/3 sm:h-10" />
        {/* 설명 첫 줄 */}
        <SkeletonBlock className="mb-2 h-4 w-2/3" />
        {/* 설명 둘째 줄 */}
        <SkeletonBlock className="mb-5 h-4 w-1/2" />
        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <SkeletonBlock className="h-10 w-28 rounded-full" />
          <SkeletonBlock className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ==============================
// 카드 그리드 스켈레톤
// ==============================

interface CardGridSkeletonProps {
  /** 표시할 카드 수 (기본값: 10) */
  count?: number;
}

/**
 * 카드 그리드 스켈레톤
 *
 * 여러 개의 CardSkeleton을 그리드 형태로 배치합니다.
 * 반응형으로 2~5열 그리드를 구성합니다.
 */
export function CardGridSkeleton({ count = 10 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ==============================
// 텍스트 라인 스켈레톤
// ==============================

interface TextSkeletonProps {
  /** 텍스트 라인 수 (기본값: 3) */
  lines?: number;
}

/**
 * 텍스트 라인 스켈레톤
 *
 * 여러 줄의 텍스트 로딩 상태를 표시합니다.
 * 각 줄의 너비가 자연스럽게 달라집니다.
 */
export function TextSkeleton({ lines = 3 }: TextSkeletonProps) {
  /** 자연스러운 줄 너비를 위한 배열 */
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-2/3"];

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={cn("h-4", widths[i % widths.length])}
        />
      ))}
    </div>
  );
}

// ==============================
// 수평 스크롤 카드 스켈레톤
// ==============================

interface HorizontalCardSkeletonProps {
  /** 표시할 카드 수 (기본값: 6) */
  count?: number;
}

/**
 * 수평 스크롤 카드 스켈레톤
 *
 * 출연진, 추천 콘텐츠 등 수평 스크롤 영역의 로딩 상태를 표시합니다.
 */
export function HorizontalCardSkeleton({
  count = 6,
}: HorizontalCardSkeletonProps) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-32 shrink-0 space-y-2 sm:w-36">
          <SkeletonBlock className="aspect-[2/3] w-full rounded-xl" />
          <SkeletonBlock className="h-3 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
