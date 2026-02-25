/**
 * TV 시리즈 상세 페이지 클라이언트 컴포넌트
 *
 * 줄거리, 출연진, 예고편, 비슷한 시리즈 등
 * 인터랙티브 섹션을 렌더링합니다.
 */
"use client";

import { TVShowDetail } from "@/types/tmdb";
import { Synopsis, CastList, VideoPlayer, SimilarContent } from "@/components/detail";

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
