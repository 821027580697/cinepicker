/**
 * 검색 API 라우트 핸들러
 *
 * 클라이언트에서 TMDB 검색을 수행할 때 사용합니다.
 * API 키를 서버 사이드에서 안전하게 관리합니다.
 *
 * GET /api/search?query=검색어&page=1
 */

import { NextRequest, NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  // 1단계: 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = Number(searchParams.get("page") || "1");

  // 2단계: 검색어 유효성 검사
  if (!query || !query.trim()) {
    return NextResponse.json(
      { results: [], total_results: 0 },
      { status: 200 }
    );
  }

  try {
    // 3단계: TMDB 통합 검색 실행
    const data = await searchMulti(query, page);
    return NextResponse.json(data);
  } catch (error) {
    // 4단계: 에러 처리
    console.error("검색 API 에러:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
