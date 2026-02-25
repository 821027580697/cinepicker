/**
 * TV 시리즈 상세 페이지 로딩 상태
 *
 * TV 시리즈 상세 데이터를 가져오는 동안 표시되는 스켈레톤 UI입니다.
 */

import {
  HorizontalCardSkeleton,
  TextSkeleton,
} from "@/components/common/Skeleton";

export default function TVDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* 히어로 스켈레톤 */}
      <div className="relative h-[400px] w-full md:h-[500px] lg:h-[600px]">
        <div className="h-full w-full animate-pulse bg-surface dark:bg-card" />
        <div className="absolute bottom-0 left-0 right-0 flex gap-6 p-4 lg:p-8">
          <div className="h-[280px] w-[180px] shrink-0 animate-pulse rounded-lg bg-surface-hover dark:bg-card md:h-[360px] md:w-[240px]" />
          <div className="flex-1 space-y-3 pb-8">
            <div className="h-10 w-2/3 animate-pulse rounded-lg bg-surface-hover dark:bg-card" />
            <div className="h-5 w-1/3 animate-pulse rounded-lg bg-surface-hover dark:bg-card" />
            <div className="h-4 w-1/2 animate-pulse rounded-lg bg-surface-hover dark:bg-card" />
          </div>
        </div>
      </div>

      {/* 콘텐츠 스켈레톤 */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-8">
        <TextSkeleton lines={4} />
        <HorizontalCardSkeleton count={6} />
      </div>
    </div>
  );
}
