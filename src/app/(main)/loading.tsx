/**
 * 메인 레이아웃 로딩 상태
 *
 * 페이지 전환 시 표시되는 전체 페이지 로딩 스켈레톤입니다.
 * Next.js App Router의 자동 Suspense 경계로 동작합니다.
 */

import {
  BannerSkeleton,
  HorizontalCardSkeleton,
} from "@/components/common/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-background">
      {/* 배너 스켈레톤 */}
      <BannerSkeleton />

      {/* 캐러셀 스켈레톤 (3개 섹션) */}
      <div className="space-y-8 px-4 py-8 lg:px-8">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="mb-4 h-7 w-48 rounded-lg bg-surface dark:bg-card" />
            <HorizontalCardSkeleton count={6} />
          </div>
        ))}
      </div>
    </div>
  );
}
