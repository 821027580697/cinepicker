/**
 * 마이페이지 (프로필)
 *
 * 로그인한 사용자의 프로필 정보와 활동 통계를 표시합니다.
 *
 * 구성:
 * - 프로필 카드: 아바타, 닉네임, 가입일
 * - 통계: 총 리뷰 수, 평균 평점, 보고싶다 수
 * - 장르별 선호도 차트 (리뷰 남긴 콘텐츠 장르 분석)
 * - 탭: [내 리뷰] [보고싶다] [설정]
 *
 * Server Component에서 인증 확인 + 데이터 fetch,
 * 클라이언트 컴포넌트(ProfileContent)로 인터랙티브 UI 렌더링
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileContent from "./ProfileContent";

// SEO 메타데이터
export const metadata: Metadata = {
  title: "마이페이지",
  description: "내 프로필과 활동 내역을 확인하세요.",
};

export default async function ProfilePage() {
  // 1단계: 인증 확인 — 비로그인 시 로그인 페이지로 리다이렉트
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 2단계: 사용자 통계 데이터 병렬 fetch
  const [user, reviewStats, watchlistCount, genreData] = await Promise.all([
    // 유저 기본 정보
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),

    // 리뷰 통계 (총 수, 평균 평점)
    prisma.review.aggregate({
      where: { userId },
      _count: { id: true },
      _avg: { rating: true },
    }),

    // 보고싶다 수
    prisma.watchlist.count({
      where: { userId },
    }),

    // 장르별 선호도 데이터 (리뷰한 콘텐츠 ID + 타입)
    prisma.review.findMany({
      where: { userId },
      select: {
        contentId: true,
        contentType: true,
        rating: true,
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  // 3단계: 프로필 데이터 구성
  const profileData = {
    user: {
      id: user.id,
      name: user.name || "익명 사용자",
      email: user.email || "",
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      totalReviews: reviewStats._count.id,
      averageRating: Math.round((reviewStats._avg.rating || 0) * 10) / 10,
      watchlistCount,
    },
    // 장르 분석은 클라이언트에서 TMDB API로 추가 데이터를 가져와 처리
    reviewedContents: genreData.map((r: { contentId: number; contentType: string; rating: number }) => ({
      contentId: r.contentId,
      contentType: r.contentType,
      rating: r.rating,
    })),
  };

  return <ProfileContent profile={profileData} />;
}
