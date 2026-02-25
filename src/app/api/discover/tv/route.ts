/**
 * TV 시리즈 탐색(Discover) API 라우트 핸들러
 *
 * 클라이언트에서 TV 시리즈 목록을 필터링/정렬하여 조회할 때 사용합니다.
 * TMDB API 키를 서버 사이드에서 안전하게 관리합니다.
 *
 * GET /api/discover/tv?page=1&sort_by=popularity.desc&with_genres=18&year=2024&vote_average_gte=7
 */

import { NextRequest, NextResponse } from "next/server";
import { discoverTVShows } from "@/lib/tmdb";

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

  // 첫 방영 연도 필터
  const year = searchParams.get("year");
  if (year) params.first_air_date_year = year;

  // 최소 평점 필터
  const voteAvgGte = searchParams.get("vote_average_gte");
  if (voteAvgGte) {
    params["vote_average.gte"] = voteAvgGte;
    // 평점 필터 시 최소 투표 수 설정
    params["vote_count.gte"] = "50";
  }

  // 원산지 국가 필터
  const originCountry = searchParams.get("with_origin_country");
  if (originCountry) params.with_origin_country = originCountry;

  try {
    // 3단계: TMDB discover/tv API 호출
    const data = await discoverTVShows(params, page);
    return NextResponse.json(data);
  } catch (error) {
    // 4단계: 에러 처리
    console.error("TV 시리즈 탐색 API 에러:", error);
    return NextResponse.json(
      { error: "TV 시리즈 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
