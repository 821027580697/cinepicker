/**
 * 영화 상세 페이지 클라이언트 컴포넌트
 *
 * 줄거리, 출연진, 예고편, 비슷한 영화 등
 * 인터랙티브 섹션을 렌더링합니다.
 */
"use client";

import { MovieDetail } from "@/types/tmdb";
import { Synopsis, CastList, VideoPlayer, SimilarContent } from "@/components/detail";

interface MovieDetailClientProps {
  movie: MovieDetail;
}

export default function MovieDetailClient({ movie }: MovieDetailClientProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* 줄거리 */}
      <Synopsis text={movie.overview} tagline={movie.tagline} />

      {/* 출연진 */}
      {movie.credits && movie.credits.cast.length > 0 && (
        <CastList cast={movie.credits.cast.slice(0, 20)} />
      )}

      {/* 예고편 및 영상 */}
      {movie.videos && movie.videos.results.length > 0 && (
        <VideoPlayer videos={movie.videos.results} />
      )}

      {/* 비슷한 영화 */}
      {movie.similar && movie.similar.results.length > 0 && (
        <SimilarContent items={movie.similar.results} type="movie" />
      )}
    </div>
  );
}
