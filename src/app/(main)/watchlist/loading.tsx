/**
 * 보고싶다 페이지 로딩 상태
 *
 * 보고싶다 데이터를 가져오는 동안 표시되는 스켈레톤 UI입니다.
 */

import { CardGridSkeleton, SkeletonBlock } from "@/components/common/Skeleton";

export default function WatchlistLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* 제목 */}
      <SkeletonBlock className="mb-6 h-8 w-40" />

      {/* 탭 필터 */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* 카드 그리드 */}
      <CardGridSkeleton count={10} />
    </section>
  );
}
