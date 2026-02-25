/**
 * 콘텐츠 정보 API 라우트
 *
 * TMDB API에서 영화/TV 기본 정보를 가져옵니다.
 * 클라이언트에서 TMDB API 키를 직접 노출하지 않기 위한 프록시 역할입니다.
 *
 * GET /api/content/[id]?type=movie|tv
 */

import { NextRequest, NextResponse } from "next/server";
import { getMovieDetail, getTVShowDetail } from "@/lib/tmdb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contentId = parseInt(id);
  const type = request.nextUrl.searchParams.get("type") || "movie";

  // ID 유효성 검사
  if (isNaN(contentId)) {
    return NextResponse.json(
      { error: "유효하지 않은 콘텐츠 ID입니다." },
      { status: 400 }
    );
  }

  try {
    if (type === "tv") {
      const show = await getTVShowDetail(contentId);
      return NextResponse.json({
        id: show.id,
        title: show.name,
        posterPath: show.poster_path,
        voteAverage: show.vote_average,
        releaseDate: show.first_air_date,
      });
    } else {
      const movie = await getMovieDetail(contentId);
      return NextResponse.json({
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        voteAverage: movie.vote_average,
        releaseDate: movie.release_date,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "콘텐츠 정보를 가져오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
