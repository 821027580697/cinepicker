/**
 * 프로필 페이지 로딩 상태
 *
 * 프로필 데이터를 가져오는 동안 표시되는 스켈레톤 UI입니다.
 */

import { SkeletonBlock } from "@/components/common/Skeleton";

export default function ProfileLoading() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      {/* 프로필 카드 스켈레톤 */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* 아바타 */}
          <SkeletonBlock className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
          {/* 텍스트 */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <SkeletonBlock className="mx-auto h-8 w-40 sm:mx-0" />
            <SkeletonBlock className="mx-auto h-4 w-32 sm:mx-0" />
            <SkeletonBlock className="mx-auto h-3 w-24 sm:mx-0" />
          </div>
        </div>

        {/* 통계 스켈레톤 */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-surface p-4 text-center">
              <SkeletonBlock className="mx-auto h-3 w-16" />
              <SkeletonBlock className="mx-auto mt-2 h-8 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className="mt-8">
        <div className="flex gap-4 border-b border-border pb-3">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-5 w-20" />
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
