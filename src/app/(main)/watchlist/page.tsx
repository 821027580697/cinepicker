/**
 * 보고싶다(Watchlist) 페이지
 *
 * 로그인한 사용자가 보고싶다에 등록한 콘텐츠 목록을 표시합니다.
 *
 * 기능:
 * - 보고싶다 콘텐츠 그리드 (포스터 카드)
 * - TMDB API로 콘텐츠 상세 정보 가져오기
 * - 제거 버튼
 * - 영화/TV 탭 분리
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WatchlistContent from "./WatchlistContent";

// 빌드 시 DB 호출을 방지하기 위해 동적 렌더링 강제
export const dynamic = "force-dynamic";

// SEO 메타데이터
export const metadata: Metadata = {
  title: "보고싶다",
  description: "내가 보고싶다에 등록한 영화와 TV 시리즈 목록입니다.",
};

export default async function WatchlistPage() {
  // 1단계: 인증 확인
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2단계: 보고싶다 목록 조회 (최신순)
  const watchlistItems = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // 3단계: 데이터 변환
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = watchlistItems.map((item: any) => ({
    id: item.id,
    contentId: item.contentId,
    contentType: item.contentType as "movie" | "tv",
    createdAt: item.createdAt.toISOString(),
  }));

  return <WatchlistContent items={items} />;
}
