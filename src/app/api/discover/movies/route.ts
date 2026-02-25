/**
 * 영화 탐색(Discover) API 라우트 핸들러
 *
 * 클라이언트에서 영화 목록을 필터링/정렬하여 조회할 때 사용합니다.
 * TMDB API 키를 서버 사이드에서 안전하게 관리합니다.
 *
 * GET /api/discover/movies?page=1&sort_by=popularity.desc&with_genres=28&year=2024&vote_average_gte=7
 */

import { NextRequest, NextResponse } from "next/server";
import { discoverMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  // 1단계: 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");

  // 2단계: TMDB discover API에 전달할 파라미터 구성
  const params: Record<string, string> = {};

  // 정렬 기준 (기본값: 인기순)
  const sortBy = searchParams.get("sort_by");
  if (sortBy) params.sort_by = sortBy;

  // 장르 필터 (콤마 구분 ID)
  const genres = searchParams.get("with_genres");
  if (genres) params.with_genres = genres;

  // 개봉 연도 필터
  const year = searchParams.get("year");
  if (year) params.primary_release_year = year;

  // 최소 평점 필터
  const voteAvgGte = searchParams.get("vote_average_gte");
  if (voteAvgGte) {
    params["vote_average.gte"] = voteAvgGte;
    // 평점 필터 시 최소 투표 수 설정 (너무 적은 투표 수 제외)
    params["vote_count.gte"] = "50";
  }

  try {
    // 3단계: TMDB discover/movie API 호출
    const data = await discoverMovies(params, page);
    return NextResponse.json(data);
  } catch (error) {
    // 4단계: 에러 처리
    console.error("영화 탐색 API 에러:", error);
    return NextResponse.json(
      { error: "영화 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
