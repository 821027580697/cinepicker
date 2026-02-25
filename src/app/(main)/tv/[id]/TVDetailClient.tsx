/**
 * TV 시리즈 상세 페이지 클라이언트 컴포넌트
 *
 * 줄거리, 출연진, 예고편, 비슷한 시리즈 등
 * 인터랙티브 섹션을 렌더링합니다.
 *
 * VideoPlayer는 YouTube iframe을 포함하므로 dynamic import로 지연 로딩합니다.
 */
"use client";

import dynamic from "next/dynamic";
import { TVShowDetail } from "@/types/tmdb";
import { Synopsis, CastList, SimilarContent } from "@/components/detail";

/** YouTube 예고편 플레이어: 뷰포트 아래에 위치 → 코드 스플리팅 */
const VideoPlayer = dynamic(() => import("@/components/detail/VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="py-8">
      <div className="mb-5 h-7 w-48 animate-pulse rounded-lg bg-surface" />
      <div className="aspect-video w-full animate-pulse rounded-xl bg-surface" />
    </div>
  ),
});

interface TVDetailClientProps {
  show: TVShowDetail;
}

export default function TVDetailClient({ show }: TVDetailClientProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* 줄거리 */}
      <Synopsis text={show.overview} tagline={show.tagline} />

      {/* 출연진 */}
      {show.credits && show.credits.cast.length > 0 && (
        <CastList cast={show.credits.cast.slice(0, 20)} />
      )}

      {/* 예고편 및 영상 */}
      {show.videos && show.videos.results.length > 0 && (
        <VideoPlayer videos={show.videos.results} />
      )}

      {/* 비슷한 TV 시리즈 */}
      {show.similar && show.similar.results.length > 0 && (
        <SimilarContent items={show.similar.results} type="tv" />
      )}
    </div>
  );
}
