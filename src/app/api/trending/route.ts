/**
 * 트렌딩 콘텐츠 API 라우트 핸들러
 *
 * 클라이언트에서 트렌딩 콘텐츠를 조회할 때 사용합니다.
 * 미디어 타입(movie/tv/all)과 시간 범위(day/week)를 지정할 수 있습니다.
 *
 * GET /api/trending?media_type=movie&time_window=day&page=1
 */

import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb";
import type { MediaType, TimeWindow } from "@/types/tmdb";

export async function GET(request: NextRequest) {
  // 1단계: 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url);
  const mediaType = (searchParams.get("media_type") || "all") as MediaType;
  const timeWindow = (searchParams.get("time_window") || "day") as TimeWindow;
  const page = Number(searchParams.get("page") || "1");

  // 2단계: 유효성 검사
  const validMediaTypes: MediaType[] = ["movie", "tv", "person", "all"];
  const validTimeWindows: TimeWindow[] = ["day", "week"];

  if (!validMediaTypes.includes(mediaType)) {
    return NextResponse.json(
      { error: "유효하지 않은 media_type입니다." },
      { status: 400 }
    );
  }

  if (!validTimeWindows.includes(timeWindow)) {
    return NextResponse.json(
      { error: "유효하지 않은 time_window입니다." },
      { status: 400 }
    );
  }

  try {
    // 3단계: TMDB trending API 호출
    const data = await getTrending(mediaType, timeWindow, page);
    return NextResponse.json(data);
  } catch (error) {
    // 4단계: 에러 처리
    console.error("트렌딩 API 에러:", error);
    return NextResponse.json(
      { error: "트렌딩 콘텐츠를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
